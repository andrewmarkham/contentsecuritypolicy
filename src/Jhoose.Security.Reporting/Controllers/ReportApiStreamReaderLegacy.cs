
using System.Text.Json;

using Jhoose.Security.Reporting.Models;

using MyCSharp.HttpUserAgentParser.Providers;

namespace Jhoose.Security.Reporting.Controllers;

public class ReportApiStreamReaderLegacy(IHttpUserAgentParserProvider parser)
{
    public async Task<List<ReportTo<IReportToBody>>> ReadAsync(Stream stream, string userAgent, CancellationToken cancellationToken = default)
    {
        var buffer = new byte[2048];
        JsonReaderState readerState;
        bool isFinalBlock;        

        (_, buffer) = await ReadToFillBufferAsync(stream, buffer, 0, cancellationToken);

        var reader = new Utf8JsonReader(buffer, isFinalBlock: false, state: default);

        var reports = new List<ReportTo<IReportToBody>>();
        dynamic propertyBag = new System.Dynamic.ExpandoObject();

        string? currentPropertyName = null;
        bool isComplete = false;
        bool isCspReport = false;  //this is produced by FF;

        var userAgentInfo = parser.Parse(userAgent);

        while (!isComplete)
        {
            if (!reader.Read())
            {
                // Not enough of the JSON is in the buffer to complete a read.
                (buffer, readerState, isFinalBlock) = await GetMoreBytesFromStream(stream, buffer, reader.CurrentState, reader.BytesConsumed, cancellationToken);

                reader = new Utf8JsonReader(buffer, isFinalBlock: isFinalBlock, readerState);
                continue;
            }

            switch (reader.TokenType)
            {
                case JsonTokenType.StartObject:
                    break;
                case JsonTokenType.PropertyName:
                    currentPropertyName = reader.GetString();

                    isCspReport |= currentPropertyName == "csp-report";

                    break;
                case JsonTokenType.String:
                    if (!string.IsNullOrEmpty(currentPropertyName))
                    {
                        var value = reader.GetString();
                        ((IDictionary<string, object?>)propertyBag)[currentPropertyName] = value;
                        currentPropertyName = null;
                    }
                    break;
                case JsonTokenType.Number:
                    if (!string.IsNullOrEmpty(currentPropertyName))
                    {
                        var value = reader.GetInt32();
                        ((IDictionary<string, object?>)propertyBag)[currentPropertyName] = value;
                        currentPropertyName = null;
                    }
                    break;
                case JsonTokenType.EndObject:
                    if (reader.CurrentDepth == 1)
                    {
                        ReportTo<IReportToBody>? report = null;

                        if (isCspReport)
                        {
                            report = CreateCspReportToBodyFromFFCspReport(userAgent, propertyBag);
                            isComplete = true;
                        }
                        else
                        {
                            report = propertyBag.type switch
                            {
                                "csp-violation" => CreateCspReportToBody(userAgent, propertyBag),
                                "permissions-policy-violation" => CreatePermissionsReportToBody(userAgent, propertyBag),
                                "deprecation" => CreateDeprecationReportToBody(userAgent, propertyBag),
                                _ => null
                            };

                        }

                        if (report != null)
                        { 
                            report.Browser = userAgentInfo.Name ?? string.Empty;
                            report.Version = userAgentInfo.Version ?? string.Empty;
                            report.OS = userAgentInfo.Platform?.Name ?? string.Empty;

                            reports.Add(report);
                        }
                    }
                    break;
                case JsonTokenType.EndArray:
                    isComplete = true;
                    break;
                default:
                    break;
            }
        }

        return reports;
    }

    private static ReportTo<IReportToBody> CreateCspReportToBodyFromFFCspReport(string userAgent, dynamic propertyBag)
    {
        return new ReportTo<IReportToBody>(
                    0,
                    "csp-violation",
                    ((IDictionary<string, object>)propertyBag)["document-uri"]?.ToString() ?? string.Empty,
                    userAgent,
                    new CspReportToBody(
                        ((IDictionary<string, object>)propertyBag)["document-uri"]?.ToString() ?? string.Empty,
                        propertyBag.disposition,
                        propertyBag.referrer,
                        ((IDictionary<string, object>)propertyBag)["effective-directive"]?.ToString() ?? string.Empty,
                        ((IDictionary<string, object>)propertyBag)["blocked-uri"]?.ToString() ?? string.Empty,
                        ((IDictionary<string, object>)propertyBag)["original-policy"]?.ToString() ?? string.Empty,
                        (int?)((IDictionary<string, object>)propertyBag)["status-code"] ?? 200,
                        string.Empty),
                    DateTime.UtcNow);
    }

    private static ReportTo<IReportToBody> CreateDeprecationReportToBody(string userAgent, dynamic propertyBag)
    {
        return new ReportTo<IReportToBody>(propertyBag.age ?? 0,
                                        propertyBag.type ?? string.Empty,
                                        propertyBag.url ?? string.Empty,
                                        userAgent,
                                        new DeprecationReportToBody(
                                            propertyBag.id,
                                            propertyBag.lineNumber,
                                            propertyBag.columnNumber,
                                            propertyBag.message,
                                            propertyBag.sourceFile),
                                        DateTime.UtcNow);
    }

    private static ReportTo<IReportToBody> CreatePermissionsReportToBody(string userAgent, dynamic propertyBag)
    {
        return new ReportTo<IReportToBody>(propertyBag.age ?? 0,
                                        propertyBag.type ?? string.Empty,
                                        propertyBag.url ?? string.Empty,
                                        userAgent,
                                        new PermissionsReportToBody(
                                            propertyBag.disposition,
                                            propertyBag.policyId,
                                            propertyBag.message,
                                            propertyBag.sourceFile,
                                            propertyBag.lineNumber,
                                            propertyBag.columnNumber),
                                        DateTime.UtcNow);
    }

    private static ReportTo<IReportToBody> CreateCspReportToBody(string userAgent, dynamic propertyBag)
    {
        return new ReportTo<IReportToBody>(
                                        propertyBag.age ?? 0,
                                        propertyBag.type ?? string.Empty,
                                        propertyBag.url ?? string.Empty,
                                        userAgent,
                                        new CspReportToBody(
                                            propertyBag.documentURL,
                                            propertyBag.disposition,
                                            propertyBag.referrer,
                                            propertyBag.effectiveDirective,
                                            propertyBag.blockedURL,
                                            propertyBag.originalPolicy,
                                            propertyBag.statusCode,
                                            propertyBag.sample),
                                        DateTime.UtcNow);
    }

    private static async Task<(byte[] buffer, JsonReaderState readerState, bool isFinalBlock)> GetMoreBytesFromStream(Stream stream, byte[] buffer, JsonReaderState readerState, long bytesConsumed, CancellationToken cancellationToken = default)
    {
        int bytesRead;
        if (bytesConsumed < buffer.Length)
        {
            ReadOnlySpan<byte> leftover = buffer.AsSpan((int)bytesConsumed);

            leftover.CopyTo(buffer);
            (bytesRead,buffer) = await ReadToFillBufferAsync(stream, buffer, leftover.Length, cancellationToken);
        }
        else
        {
            (bytesRead,buffer) = await ReadToFillBufferAsync(stream, buffer, 0, cancellationToken);
        }

        var reader = new Utf8JsonReader(buffer, isFinalBlock: bytesRead == 0, readerState);
        return (buffer, reader.CurrentState, bytesRead == 0);
    }

    private static async Task<(int totalRead, byte[] buffer)> ReadToFillBufferAsync(Stream stream, byte[] buffer, int startingPosition, CancellationToken cancellationToken = default)
    {
        var totalRead = startingPosition;
        int bytesRead = 0;
        bool readFinished = false;

        while (readFinished == false)
        {   
            bytesRead = await stream.ReadAsync(buffer, totalRead, buffer.Length - totalRead, cancellationToken);
            totalRead += bytesRead;

            if (bytesRead == 0  || totalRead == buffer.Length)
                readFinished = true;
        }

        return (totalRead, buffer);
    }
}
