<<<<<<<< HEAD:src/Jhoose.Security/Features/Reporting/Controllers/ReportApiStreamReaderLegacy.cs
========
using System.Buffers;
using System.Runtime.CompilerServices;

using System.Text.Json;
>>>>>>>> main:src/Jhoose.Security.Reporting/Controllers/ReportApiStreamReader.cs

using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Jhoose.Security.Features.Reporting.Models;

using MyCSharp.HttpUserAgentParser.Providers;

namespace Jhoose.Security.Features.Reporting.Controllers;

<<<<<<<< HEAD:src/Jhoose.Security/Features/Reporting/Controllers/ReportApiStreamReaderLegacy.cs
public class ReportApiStreamReaderLegacy(IHttpUserAgentParserProvider parser)
{
    public async Task<List<ReportTo<IReportToBody>>> ReadAsync(Stream stream, string userAgent, CancellationToken cancellationToken = default)
========
    enum ReportType
>>>>>>>> main:src/Jhoose.Security.Reporting/Controllers/ReportApiStreamReader.cs
    {
        Unknown,
        CspViolation,
        PermissionsPolicyViolation,
        Deprecation,

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

        Id
    }

public sealed class ReportApiStreamReader(IHttpUserAgentParserProvider parser)
{
    private const int BufferSize = 4096 * 4;
    private const int BufferAt90Percent = BufferSize / 100 * 90;

    public async IAsyncEnumerable<ReportTo<IReportToBody>> ReadAsync(Stream stream, string userAgent, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var buffer = ArrayPool<byte>.Shared.Rent(BufferSize);

        bool isComplete = false;
        bool isArray = false;
        bool isFinalBlock = false;
        long totalRead = 0;
        JsonReaderState readerState = default;
        long bufferPosition = 0;

        var userAgentInfo = parser.Parse(userAgent);

        try
        {
            (totalRead, buffer) = await ReadToFillBufferAsync(stream, buffer, 0, cancellationToken);
            isFinalBlock = totalRead < BufferSize;

            while (!isComplete)
            {
                if (buffer[bufferPosition] == 0 || bufferPosition >= BufferAt90Percent)
                {
                    // get the postion of the first null byte
                    (totalRead, buffer) = await ReadToFillBufferAsync(stream, buffer, (int)bufferPosition, cancellationToken);
                    isFinalBlock = totalRead < BufferSize;
                    bufferPosition = 0;
                }
                else if (buffer[bufferPosition] == (byte)'[')
                {
                    isArray = true;

                    // we have recieved an array of reports
                    (var nextState, totalRead, var report) = ParseReport(buffer.AsSpan()[(int)bufferPosition..], readerState, userAgent);
                    
                    readerState = nextState;

                    bufferPosition += totalRead;

                    report.Browser = userAgentInfo.Name ?? string.Empty;
                    report.Version = userAgentInfo.Version ?? string.Empty;
                    report.OS = userAgentInfo.Platform?.Name ?? string.Empty;

                    yield return report;
                }
                else if (buffer[bufferPosition] == (byte)']')
                {
                    // we are at then end of an array of reports, so finish
                    isComplete = true;
                }
                else
                {
                    (var nextState, totalRead, var report) = ParseReport(buffer.AsSpan()[(int)bufferPosition..], readerState, userAgent);
                    
                    readerState = nextState;
                    bufferPosition += totalRead;

                    report.Browser = userAgentInfo.Name ?? string.Empty;
                    report.Version = userAgentInfo.Version ?? string.Empty;
                    report.OS = userAgentInfo.Platform?.Name ?? string.Empty;

                    yield return report;

                    if (!isArray)
                        isComplete = true;
                }
            }
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer, clearArray: true);
        }
    }
    private static (JsonReaderState state, long bytesConsumed, ReportTo<IReportToBody>) ParseReport(ReadOnlySpan<byte> buffer, JsonReaderState prevState, string userAgent)
    {
        bool isComplete = false;

        ReportType reportType = ReportType.Unknown;
        
        CurrentPropertyName currentPropertyName = CurrentPropertyName.None;
        ReadOnlySpan<byte> url = [];
        ReadOnlySpan<byte> bodyBuffer = [];
        IReportToBody? body = null;

        int age = 0;
        long totalBytesConsumed = 0;

        var reader = new Utf8JsonReader(buffer, isFinalBlock: true, state: prevState);
        
        while (!isComplete)
        {
            reader.Read();

            switch (reader.TokenType)
            {
                case JsonTokenType.StartObject:

                    if (currentPropertyName == CurrentPropertyName.Body || reportType == ReportType.Firefox_CSP_Report)
                    {
                        // We will parse the body based on the report type
                        int startingPosition = buffer.Slice((int)reader.BytesConsumed - 1).IndexOf((byte)'}');
                        bodyBuffer = buffer.Slice((int)reader.BytesConsumed - 1,startingPosition+1);

                        if (reportType != ReportType.Firefox_CSP_Report)
                            reader.Skip();
                    } 
                    else
                    {
                        currentPropertyName = CurrentPropertyName.None;
                        reportType = ReportType.Unknown;
                    }
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
                            var span when span.SequenceEqual("deprecation"u8) => ReportType.Deprecation,
                            _ => ReportType.Unknown
                        };
                    }
                    else if (currentPropertyName == CurrentPropertyName.Url)
                    {
                        url = reader.ValueSpan;
                    }
                    else if (currentPropertyName == CurrentPropertyName.Age)
                    {
                        age = reader.GetInt32();
                    }
                break;
                case JsonTokenType.EndObject:
                case JsonTokenType.EndArray:
                    if (reader.CurrentDepth == 1)
                        isComplete = true;
                        break;
                    
                default:
                    break;
            }
        }

        totalBytesConsumed += reader.BytesConsumed;

        body = reportType == ReportType.Firefox_CSP_Report ? ParseFFBody(bodyBuffer) : ParseBody(bodyBuffer, reportType);

        var type = reportType switch
        {
            ReportType.CspViolation => "csp-violation",
            ReportType.PermissionsPolicyViolation => "permissions-policy-violation",
            ReportType.Deprecation => "deprecation",
            ReportType.Firefox_CSP_Report => "csp-violation",
            _ => "unknown"
        };

        var urlString = reportType == ReportType.Firefox_CSP_Report ? (body as CspReportToBody)?.DocumentURL : System.Text.Encoding.UTF8.GetString(url);
        
        var report = new ReportTo<IReportToBody>(age, type, urlString ?? string.Empty, userAgent, body!, DateTime.UtcNow);

        return (reader.CurrentState, totalBytesConsumed, report);
 
    }
    private  static IReportToBody? ParseBody(ReadOnlySpan<byte> sourceBuffer, ReportType reportType)
    {
        var reader = new Utf8JsonReader(sourceBuffer, isFinalBlock: false, default);

        bool isComplete = false;
        CurrentBodyPropertyName currentBodyPropertyName = CurrentBodyPropertyName.None;

        ReadOnlySpan<byte> blockedURL = [];
        ReadOnlySpan<byte> disposition = [];
        ReadOnlySpan<byte> documentURL = [];
        ReadOnlySpan<byte> effectiveDirective = [];
        ReadOnlySpan<byte> originalPolicy = [];
        ReadOnlySpan<byte> referrer = [];
        ReadOnlySpan<byte> sample = [];
        int statusCode = 0;
        int columnNumber = 0;
        int lineNumber = 0;
        ReadOnlySpan<byte> message = [];
        ReadOnlySpan<byte> policyId = [];
        ReadOnlySpan<byte> sourceFile = [];
        ReadOnlySpan<byte> id = [];

        while (!isComplete)
        {
            reader.Read();
            
            switch (reader.TokenType)
            {
                case JsonTokenType.StartObject:
                    break;
                case JsonTokenType.PropertyName:
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
                            var span when span.SequenceEqual("lineNumber"u8) => CurrentBodyPropertyName.LineNumber,
                            var span when span.SequenceEqual("message"u8) => CurrentBodyPropertyName.Message,
                            var span when span.SequenceEqual("policyId"u8) => CurrentBodyPropertyName.PolicyId,
                            var span when span.SequenceEqual("sourceFile"u8) => CurrentBodyPropertyName.SourceFile,

                            var span when span.SequenceEqual("id"u8) => CurrentBodyPropertyName.Id,

                            _ => CurrentBodyPropertyName.None
                        };
                break;
                case JsonTokenType.String:
                case JsonTokenType.Number:
                    // We could capture body properties here if needed

                    switch (currentBodyPropertyName)
                    {
                        case CurrentBodyPropertyName.BlockedURL:
                            blockedURL = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.Disposition:
                            disposition = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.DocumentURL:
                            documentURL = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.EffectiveDirective:
                            effectiveDirective = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.OriginalPolicy:
                            originalPolicy = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.Referrer:
                            referrer = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.Sample:
                            sample = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.StatusCode:
                            statusCode = reader.GetInt32();
                            break;

                        case CurrentBodyPropertyName.ColumnNumber:
                            columnNumber = reader.GetInt32();
                            break;
                        case CurrentBodyPropertyName.LineNumber:
                            lineNumber = reader.GetInt32();
                            break;
                        case CurrentBodyPropertyName.Message:
                            message = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.PolicyId:
                            policyId = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.SourceFile:
                            sourceFile = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.Id:
                            id = reader.ValueSpan;
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

        IReportToBody? reportToBody =  reportType switch
        {
            ReportType.CspViolation => new  CspReportToBody(
                documentURL.Length > 0 ? System.Text.Encoding.UTF8.GetString(documentURL) : null,
                disposition.Length > 0 ? System.Text.Encoding.UTF8.GetString(disposition) : null,
                referrer.Length > 0 ? System.Text.Encoding.UTF8.GetString(referrer) : null,
                effectiveDirective.Length > 0 ? System.Text.Encoding.UTF8.GetString(effectiveDirective) : null,
                blockedURL.Length > 0 ? System.Text.Encoding.UTF8.GetString(blockedURL) : null,
                originalPolicy.Length > 0 ? System.Text.Encoding.UTF8.GetString(originalPolicy) : null,
                statusCode,
                sample.Length > 0 ? System.Text.Encoding.UTF8.GetString(sample) : null
            ),
            ReportType.PermissionsPolicyViolation => new PermissionsReportToBody(
                disposition.Length > 0 ? System.Text.Encoding.UTF8.GetString(disposition) : null,
                policyId.Length > 0 ? System.Text.Encoding.UTF8.GetString(policyId) : null,
                message.Length > 0 ? System.Text.Encoding.UTF8.GetString(message) : null,
                sourceFile.Length > 0 ? System.Text.Encoding.UTF8.GetString(sourceFile) : null,
                lineNumber,
                columnNumber
            ),
            ReportType.Deprecation => new DeprecationReportToBody(
                id.Length > 0 ? System.Text.Encoding.UTF8.GetString(id) : null,
                lineNumber,
                columnNumber,
                message.Length > 0 ? System.Text.Encoding.UTF8.GetString(message) : null,
                sourceFile.Length > 0 ? System.Text.Encoding.UTF8.GetString(sourceFile) : null
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

        ReadOnlySpan<byte> blockedURL = [];
        ReadOnlySpan<byte> disposition = [];
        ReadOnlySpan<byte> documentURL = [];
        ReadOnlySpan<byte> effectiveDirective = [];
        ReadOnlySpan<byte> originalPolicy = [];
        ReadOnlySpan<byte> referrer = [];
        int statusCode = 0;
        ReadOnlySpan<byte> violatedDirective = [];

        while (!isComplete)
        {
            reader.Read();
            
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
                            blockedURL = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.Disposition:
                            disposition = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.DocumentURL:
                            documentURL = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.EffectiveDirective:
                            effectiveDirective = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.OriginalPolicy:
                            originalPolicy = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.Referrer:
                            referrer = reader.ValueSpan;
                            break;
                        case CurrentBodyPropertyName.ViolatedDirective:
                            violatedDirective = reader.ValueSpan;
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

        return new  CspReportToBody(
                documentURL.Length > 0 ? System.Text.Encoding.UTF8.GetString(documentURL) : null,
                disposition.Length > 0 ? System.Text.Encoding.UTF8.GetString(disposition) : null,
                referrer.Length > 0 ? System.Text.Encoding.UTF8.GetString(referrer) : null,
                effectiveDirective.Length > 0 ? System.Text.Encoding.UTF8.GetString(effectiveDirective) : null,
                blockedURL.Length > 0 ? System.Text.Encoding.UTF8.GetString(blockedURL) : null,
                originalPolicy.Length > 0 ? System.Text.Encoding.UTF8.GetString(originalPolicy) : null,
                statusCode,
                violatedDirective.Length > 0 ? System.Text.Encoding.UTF8.GetString(violatedDirective) : null
            );
    }

    private static async Task<(int totalRead, byte[] buffer)> ReadToFillBufferAsync(Stream stream, byte[] buffer, int bufferPosition, CancellationToken cancellationToken = default)
    {
        var totalRead = 0;
        bool readFinished = false;

        if (bufferPosition > 0)
        {
            //var s = System.Text.Encoding.UTF8.GetString(buffer);
            //shift existing data to start of buffer
            //bufferPosition++;
            Buffer.BlockCopy(buffer, bufferPosition, buffer, 0, buffer.Length - bufferPosition);

            //var s1 = System.Text.Encoding.UTF8.GetString(buffer);

            totalRead = buffer.Length - bufferPosition;
        }
    
        while (readFinished == false)
        {   
            var bytesRead = await stream.ReadAsync(buffer, totalRead, buffer.Length - totalRead, cancellationToken);
            totalRead += bytesRead;

            if (bytesRead == 0  || totalRead == buffer.Length)
                readFinished = true;
        }
        return (totalRead, buffer);
    }
}