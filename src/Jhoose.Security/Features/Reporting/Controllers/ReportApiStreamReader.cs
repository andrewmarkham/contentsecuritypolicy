using System;
using System.Buffers;
using System.Collections.Generic;
using System.IO;
using System.Runtime.CompilerServices;

using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Jhoose.Security.Features.Reporting.Models;

using MyCSharp.HttpUserAgentParser.Providers;

namespace Jhoose.Security.Features.Reporting.Controllers;

    enum ReportType
    {
        Unknown,
        CspViolation,
        PermissionsPolicyViolation,
        PotentialPermissionsPolicyViolation,
        Deprecation,
        Intervention,

        Firefox_CSP_Report
    }

    enum CurrentPropertyName
    {
        None,
        Type,
        Url,
        Age,
        Body
    }

    enum CurrentBodyPropertyName 
    {
        None,
        BlockedURL,
        Disposition,
        DocumentURL,
        EffectiveDirective,
        ViolatedDirective,
        OriginalPolicy,
        Referrer,
        Sample,
        StatusCode,

        ColumnNumber,
        LineNumber,
        Message,
        PolicyId,
        SourceFile,
        AllowAttribute,

        Id
    }

public sealed class ReportApiStreamReader(IHttpUserAgentParserProvider parser)
{
    private const int BufferSize = 4096 * 4;

    // A single report larger than this is rejected rather than growing the buffer further
    private const int MaxBufferSize = 1024 * 1024;

    public async IAsyncEnumerable<ReportTo<IReportToBody>> ReadAsync(Stream stream, string userAgent, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var buffer = ArrayPool<byte>.Shared.Rent(BufferSize);

        // buffer[position..dataLength] is the data not yet parsed. Anything after dataLength is left over from
        // a previous use of the pooled array, so it is never read.
        int position = 0;
        int dataLength = 0;
        bool streamEnded = false;
        bool isArray = false;
        bool isComplete = false;

        var userAgentInfo = parser.Parse(userAgent);

        try
        {
            (dataLength, streamEnded) = await FillBufferAsync(stream, buffer, 0, cancellationToken);

            if (dataLength >= 3 && buffer[0] == 0xEF && buffer[1] == 0xBB && buffer[2] == 0xBF)
                position = 3;

            while (!isComplete)
            {
                // the array separators are handled here, so each report is parsed on its own
                position = SkipSeparators(buffer, position, dataLength, skipCommas: isArray);

                if (position == dataLength)
                {
                    if (streamEnded)
                    {
                        if (isArray)
                            throw new JsonException("Unexpected end of data, the array of reports is not closed.");

                        break;
                    }

                    (dataLength, streamEnded) = await FillBufferAsync(stream, buffer, 0, cancellationToken);
                    position = 0;
                    continue;
                }

                switch (buffer[position])
                {
                    case (byte)'[' when !isArray:
                        isArray = true;
                        position++;
                        break;

                    case (byte)']' when isArray:
                        isComplete = true;
                        break;

                    case (byte)'{':
                        var (bytesConsumed, report) = ParseReport(buffer.AsSpan(position, dataLength - position), streamEnded, userAgent);

                        if (report is null)
                        {
                            // The report continues past the data read so far. Move it to the start of the buffer,
                            // growing the buffer only if the report already fills it, and read more.
                            int remaining = dataLength - position;

                            if (position == 0)
                                buffer = GrowBuffer(buffer, remaining);
                            else
                                Buffer.BlockCopy(buffer, position, buffer, 0, remaining);

                            (dataLength, streamEnded) = await FillBufferAsync(stream, buffer, remaining, cancellationToken);
                            position = 0;
                            break;
                        }

                        position += bytesConsumed;

                        report.Browser = userAgentInfo.Name ?? string.Empty;
                        report.Version = userAgentInfo.Version ?? string.Empty;
                        report.OS = userAgentInfo.Platform?.Name ?? string.Empty;

                        yield return report;

                        if (!isArray)
                            isComplete = true;
                        break;

                    default:
                        throw new JsonException($"Unexpected character '{(char)buffer[position]}' in the reports.");
                }
            }
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer, clearArray: true);
        }
    }

    private static int SkipSeparators(byte[] buffer, int position, int dataLength, bool skipCommas)
    {
        while (position < dataLength)
        {
            var b = buffer[position];

            if (b != (byte)' ' && b != (byte)'\n' && b != (byte)'\r' && b != (byte)'\t' && !(skipCommas && b == (byte)','))
                break;

            position++;
        }

        return position;
    }

    private static byte[] GrowBuffer(byte[] buffer, int dataLength)
    {
        if (buffer.Length >= MaxBufferSize)
            throw new JsonException($"A report is larger than the {MaxBufferSize} byte limit.");

        var larger = ArrayPool<byte>.Shared.Rent(buffer.Length * 2);
        Buffer.BlockCopy(buffer, 0, larger, 0, dataLength);
        ArrayPool<byte>.Shared.Return(buffer, clearArray: true);

        return larger;
    }

    /// <summary>
    /// Parses the report at the start of the buffer.
    /// </summary>
    /// <returns>The report and the bytes it used, or a null report when it continues past the end of the buffer.</returns>
    private static (int bytesConsumed, ReportTo<IReportToBody>? report) ParseReport(ReadOnlySpan<byte> buffer, bool isFinalBlock, string userAgent)
    {
        bool isComplete = false;

        ReportType reportType = ReportType.Unknown;
        
        CurrentPropertyName currentPropertyName = CurrentPropertyName.None;
        JsonString url = default;
        ReadOnlySpan<byte> bodyBuffer = [];
        IReportToBody? body = null;
        BodyValues bodyValues = default;

        int age = 0;

        var reader = new Utf8JsonReader(buffer, isFinalBlock, state: default);

        while (!isComplete)
        {
            // only returns false when more data is needed, nothing has been allocated by this point
            if (!reader.Read())
                return (0, null);

            switch (reader.TokenType)
            {
                case JsonTokenType.StartObject:

                    if (reportType == ReportType.Firefox_CSP_Report)
                    {
                        // Skip a copy of the reader to find the end of the body, rather than searching for '}',
                        // as string values and nested objects can contain it.
                        int bodyStart = (int)reader.TokenStartIndex;
                        var bodyReader = reader;

                        if (!bodyReader.TrySkip())
                            return (0, null);

                        bodyBuffer = buffer[bodyStart..(int)bodyReader.BytesConsumed];
                        reader = bodyReader;
                    }
                    else if (currentPropertyName == CurrentPropertyName.Body)
                    {
                        // The type usually comes after the body (Chrome sorts the properties), so capture the body
                        // values in this pass and create the body for the type at the end
                        if (!TryReadBody(ref reader, ref bodyValues))
                            return (0, null);
                    }
                    else if (reader.CurrentDepth > 0)
                    {
                        // an object we don't use
                        if (!reader.TrySkip())
                            return (0, null);
                    }
                    break;
                case JsonTokenType.StartArray:
                    if (!reader.TrySkip())
                        return (0, null);
                    break;
                case JsonTokenType.PropertyName:
                    if (reader.ValueSpan.SequenceEqual("csp-report"u8))
                    {
                        // Special case for Firefox CSP reports
                        // We can short-circuit parsing here
                        reportType = ReportType.Firefox_CSP_Report;
                    } 

                    currentPropertyName = reader.ValueSpan switch
                        {
                            var span when span.SequenceEqual("type"u8) => CurrentPropertyName.Type,
                            var span when span.SequenceEqual("url"u8) => CurrentPropertyName.Url,
                            var span when span.SequenceEqual("age"u8) => CurrentPropertyName.Age,
                            var span when span.SequenceEqual("body"u8) => CurrentPropertyName.Body,
                            _ => CurrentPropertyName.None
                        };
                    break;
                case JsonTokenType.String:
                case JsonTokenType.Number:
                    if (currentPropertyName == CurrentPropertyName.Type)
                    {
                        reportType = reader.ValueSpan switch
                        {
                            var span when span.SequenceEqual("csp-violation"u8) => ReportType.CspViolation,
                            var span when span.SequenceEqual("permissions-policy-violation"u8) => ReportType.PermissionsPolicyViolation,
                            var span when span.SequenceEqual("potential-permissions-policy-violation"u8) => ReportType.PotentialPermissionsPolicyViolation,
                            var span when span.SequenceEqual("deprecation"u8) => ReportType.Deprecation,
                            var span when span.SequenceEqual("intervention"u8) => ReportType.Intervention,
                            _ => ReportType.Unknown
                        };
                    }
                    else if (currentPropertyName == CurrentPropertyName.Url)
                    {
                        url = JsonString.From(ref reader);
                    }
                    else if (currentPropertyName == CurrentPropertyName.Age && reader.TryGetInt32(out var value))
                    {
                        age = value;
                    }
                break;
                case JsonTokenType.EndObject:
                    // the end of the report itself
                    if (reader.CurrentDepth == 0)
                        isComplete = true;
                    break;
                    
                default:
                    break;
            }
        }

        body = reportType == ReportType.Firefox_CSP_Report ? ParseFFBody(bodyBuffer) : CreateBody(reportType, ref bodyValues);

        var type = reportType switch
        {
            ReportType.CspViolation => "csp-violation",
            ReportType.PermissionsPolicyViolation => "permissions-policy-violation",
            // shortened to fit the 30 character Type column
            ReportType.PotentialPermissionsPolicyViolation => "potential-permissions-policy",
            ReportType.Deprecation => "deprecation",
            ReportType.Intervention => "intervention",
            ReportType.Firefox_CSP_Report => "csp-violation",
            _ => "unknown"
        };

        var urlString = reportType == ReportType.Firefox_CSP_Report ? (body as CspReportToBody)?.DocumentURL : url.ToStringOrNull();
        
        var report = new ReportTo<IReportToBody>(age, type, urlString ?? string.Empty, userAgent, body!, DateTime.UtcNow);

        return ((int)reader.BytesConsumed, report);
    }
    /// <summary>
    /// A string value from the request, kept as UTF-8 bytes in the request buffer until the string is created.
    /// Escaped values (e.g. \u0027 or \/) are unescaped when read, which is rare, so other values allocate nothing extra.
    /// </summary>
    private ref struct JsonString
    {
        private ReadOnlySpan<byte> utf8;
        private string? unescaped;

        public static JsonString From(scoped ref Utf8JsonReader reader) => reader.ValueIsEscaped
            ? new JsonString { unescaped = reader.GetString() }
            : new JsonString { utf8 = reader.ValueSpan };

        public readonly bool HasValue => unescaped is not null ? unescaped.Length > 0 : utf8.Length > 0;

        public readonly string? ToStringOrNull() => unescaped is not null
            ? (unescaped.Length > 0 ? unescaped : null)
            : (utf8.Length > 0 ? System.Text.Encoding.UTF8.GetString(utf8) : null);
    }

    // The body values of every report type
    private ref struct BodyValues
    {
        public JsonString BlockedURL;
        public JsonString Disposition;
        public JsonString DocumentURL;
        public JsonString EffectiveDirective;
        public JsonString OriginalPolicy;
        public JsonString Referrer;
        public JsonString Sample;
        public int? StatusCode;
        public int? ColumnNumber;
        public int? LineNumber;
        public JsonString Message;
        public JsonString PolicyId;
        public JsonString SourceFile;
        public JsonString AllowAttribute;
        public JsonString Id;
    }

    /// <summary>
    /// Reads the body object the reader is positioned on, leaving the reader on its end.
    /// </summary>
    /// <returns>false when the body continues past the end of the buffer.</returns>
    private static bool TryReadBody(ref Utf8JsonReader reader, ref BodyValues values)
    {
        int bodyDepth = reader.CurrentDepth;
        bool isComplete = false;
        CurrentBodyPropertyName currentBodyPropertyName = CurrentBodyPropertyName.None;

        while (!isComplete)
        {
            if (!reader.Read())
                return false;

            switch (reader.TokenType)
            {
                case JsonTokenType.StartObject:
                case JsonTokenType.StartArray:
                    // a nested value we don't use, e.g. crash_report_api
                    if (!reader.TrySkip())
                        return false;
                    break;
                case JsonTokenType.PropertyName:
                    // the permissions policy explainer uses featureId and snake case names, Chrome sends policyId and camel case
                    currentBodyPropertyName = reader.ValueSpan switch
                        {
                            var span when span.SequenceEqual("blockedURL"u8) => CurrentBodyPropertyName.BlockedURL,
                            var span when span.SequenceEqual("disposition"u8) => CurrentBodyPropertyName.Disposition,
                            var span when span.SequenceEqual("documentURL"u8) => CurrentBodyPropertyName.DocumentURL,
                            var span when span.SequenceEqual("effectiveDirective"u8) => CurrentBodyPropertyName.EffectiveDirective,
                            var span when span.SequenceEqual("originalPolicy"u8) => CurrentBodyPropertyName.OriginalPolicy,
                            var span when span.SequenceEqual("referrer"u8) => CurrentBodyPropertyName.Referrer,
                            var span when span.SequenceEqual("sample"u8) => CurrentBodyPropertyName.Sample,
                            var span when span.SequenceEqual("statusCode"u8) => CurrentBodyPropertyName.StatusCode,

                            var span when span.SequenceEqual("columnNumber"u8) => CurrentBodyPropertyName.ColumnNumber,
                            var span when span.SequenceEqual("column_number"u8) => CurrentBodyPropertyName.ColumnNumber,
                            var span when span.SequenceEqual("lineNumber"u8) => CurrentBodyPropertyName.LineNumber,
                            var span when span.SequenceEqual("line_number"u8) => CurrentBodyPropertyName.LineNumber,
                            var span when span.SequenceEqual("message"u8) => CurrentBodyPropertyName.Message,
                            var span when span.SequenceEqual("policyId"u8) => CurrentBodyPropertyName.PolicyId,
                            var span when span.SequenceEqual("featureId"u8) => CurrentBodyPropertyName.PolicyId,
                            var span when span.SequenceEqual("sourceFile"u8) => CurrentBodyPropertyName.SourceFile,
                            var span when span.SequenceEqual("source_file"u8) => CurrentBodyPropertyName.SourceFile,
                            var span when span.SequenceEqual("allowAttribute"u8) => CurrentBodyPropertyName.AllowAttribute,

                            var span when span.SequenceEqual("id"u8) => CurrentBodyPropertyName.Id,

                            _ => CurrentBodyPropertyName.None
                        };
                break;
                case JsonTokenType.String:
                case JsonTokenType.Number:
                    switch (currentBodyPropertyName)
                    {
                        case CurrentBodyPropertyName.BlockedURL:
                            values.BlockedURL = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.Disposition:
                            values.Disposition = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.DocumentURL:
                            values.DocumentURL = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.EffectiveDirective:
                            values.EffectiveDirective = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.OriginalPolicy:
                            values.OriginalPolicy = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.Referrer:
                            values.Referrer = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.Sample:
                            values.Sample = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.StatusCode:
                            if (reader.TokenType == JsonTokenType.Number && reader.TryGetInt32(out var statusCode))
                                values.StatusCode = statusCode;
                            break;

                        case CurrentBodyPropertyName.ColumnNumber:
                            if (reader.TokenType == JsonTokenType.Number && reader.TryGetInt32(out var columnNumber))
                                values.ColumnNumber = columnNumber;
                            break;
                        case CurrentBodyPropertyName.LineNumber:
                            if (reader.TokenType == JsonTokenType.Number && reader.TryGetInt32(out var lineNumber))
                                values.LineNumber = lineNumber;
                            break;
                        case CurrentBodyPropertyName.Message:
                            values.Message = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.PolicyId:
                            values.PolicyId = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.SourceFile:
                            values.SourceFile = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.AllowAttribute:
                            values.AllowAttribute = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.Id:
                            values.Id = JsonString.From(ref reader);
                            break;

                        default:
                            break;
                    }
                    break;
                case JsonTokenType.EndObject:
                    if (reader.CurrentDepth == bodyDepth)
                        isComplete = true;
                    break;
                    
                default:
                    break;
            }
        }

        return true;
    }

    private static IReportToBody? CreateBody(ReportType reportType, ref BodyValues values)
    {
        IReportToBody? reportToBody =  reportType switch
        {
            ReportType.CspViolation => new  CspReportToBody(
                values.DocumentURL.ToStringOrNull(),
                values.Disposition.ToStringOrNull(),
                values.Referrer.ToStringOrNull(),
                values.EffectiveDirective.ToStringOrNull(),
                values.BlockedURL.ToStringOrNull(),
                values.OriginalPolicy.ToStringOrNull(),
                values.StatusCode,
                values.Sample.ToStringOrNull()
            ),
            ReportType.PermissionsPolicyViolation or ReportType.PotentialPermissionsPolicyViolation => new PermissionsReportToBody(
                values.Disposition.ToStringOrNull(),
                values.PolicyId.ToStringOrNull(),
                values.Message.ToStringOrNull(),
                values.SourceFile.ToStringOrNull(),
                values.LineNumber,
                values.ColumnNumber,
                reportType == ReportType.PotentialPermissionsPolicyViolation ? values.AllowAttribute.ToStringOrNull() : null
            ),
            ReportType.Deprecation => new DeprecationReportToBody(
                values.Id.ToStringOrNull(),
                values.LineNumber,
                values.ColumnNumber,
                values.Message.ToStringOrNull(),
                values.SourceFile.ToStringOrNull()
            ),
            ReportType.Intervention => new InterventionReportToBody(
                values.Id.ToStringOrNull(),
                values.LineNumber,
                values.ColumnNumber,
                values.Message.ToStringOrNull(),
                values.SourceFile.ToStringOrNull()
            ),
            _ => null
        };

        return reportToBody;
    }

    private  static IReportToBody? ParseFFBody(ReadOnlySpan<byte> sourceBuffer)
    {
        var reader = new Utf8JsonReader(sourceBuffer, isFinalBlock: false, default);

        bool isComplete = false;
        CurrentBodyPropertyName currentBodyPropertyName = CurrentBodyPropertyName.None;

        JsonString blockedURL = default;
        JsonString disposition = default;
        JsonString documentURL = default;
        JsonString effectiveDirective = default;
        JsonString originalPolicy = default;
        JsonString referrer = default;
        int statusCode = 0;
        JsonString violatedDirective = default;
        JsonString sample = default;

        while (!isComplete)
        {
            if (!reader.Read())
                break;
            
            switch (reader.TokenType)
            {
                case JsonTokenType.StartObject:
                    break;
                case JsonTokenType.PropertyName:

                    currentBodyPropertyName = reader.ValueSpan switch
                        {
                            var span when span.SequenceEqual("blocked-uri"u8) => CurrentBodyPropertyName.BlockedURL,
                            var span when span.SequenceEqual("disposition"u8) => CurrentBodyPropertyName.Disposition,
                            var span when span.SequenceEqual("document-uri"u8) => CurrentBodyPropertyName.DocumentURL,
                            var span when span.SequenceEqual("effective-directive"u8) => CurrentBodyPropertyName.EffectiveDirective,
                            var span when span.SequenceEqual("original-policy"u8) => CurrentBodyPropertyName.OriginalPolicy,
                            var span when span.SequenceEqual("referrer"u8) => CurrentBodyPropertyName.Referrer,
                            var span when span.SequenceEqual("status-code"u8) => CurrentBodyPropertyName.StatusCode,
                            var span when span.SequenceEqual("script-sample"u8) => CurrentBodyPropertyName.Sample,

                            var span when span.SequenceEqual("violated-directive"u8) => CurrentBodyPropertyName.ViolatedDirective,

                            _ => CurrentBodyPropertyName.None
                        };
                break;
                case JsonTokenType.String:
                case JsonTokenType.Number:
                    // We could capture body properties here if needed

                    switch (currentBodyPropertyName)
                    {
                        case CurrentBodyPropertyName.BlockedURL:
                            blockedURL = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.Disposition:
                            disposition = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.DocumentURL:
                            documentURL = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.EffectiveDirective:
                            effectiveDirective = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.OriginalPolicy:
                            originalPolicy = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.Referrer:
                            referrer = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.ViolatedDirective:
                            violatedDirective = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.Sample:
                            sample = JsonString.From(ref reader);
                            break;
                        case CurrentBodyPropertyName.StatusCode:
                            statusCode = reader.GetInt32();
                            break;

                        default:
                            break;
                    }
                    break;
                case JsonTokenType.EndObject:
                    isComplete = true;
                    break;
                    
                default:
                    break;
            }
        }

        // older browsers only send violated-directive
        if (!effectiveDirective.HasValue)
            effectiveDirective = violatedDirective;

        return new  CspReportToBody(
                documentURL.ToStringOrNull(),
                disposition.ToStringOrNull(),
                referrer.ToStringOrNull(),
                effectiveDirective.ToStringOrNull(),
                blockedURL.ToStringOrNull(),
                originalPolicy.ToStringOrNull(),
                statusCode,
                sample.ToStringOrNull()
            );
    }

    /// <summary>
    /// Reads from the stream into buffer[offset..] until the buffer is full or the stream ends.
    /// </summary>
    private static async ValueTask<(int dataLength, bool streamEnded)> FillBufferAsync(Stream stream, byte[] buffer, int offset, CancellationToken cancellationToken)
    {
        var dataLength = offset;

        while (dataLength < buffer.Length)
        {
            var bytesRead = await stream.ReadAsync(buffer.AsMemory(dataLength), cancellationToken);

            if (bytesRead == 0)
                return (dataLength, true);

            dataLength += bytesRead;
        }

        return (dataLength, false);
    }
}