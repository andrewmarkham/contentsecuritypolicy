//using Newtonsoft.Json;

using System.Text.Json.Serialization;

namespace Jhoose.Security.Reporting.Models
{
    public class ReportToBody
    {
        [JsonConstructor]
        public ReportToBody(
            string? documentURL,
            string? disposition,
            string? referrer,
            string? effectiveDirective,
            string? blockedURL,
            string? originalPolicy,
            int? statusCode,
            string? sample,
            string? sourceFile,
            int? lineNumber,
            int? columnNumber
        )
        {
            DocumentURL = documentURL;
            Disposition = disposition;
            Referrer = referrer;
            EffectiveDirective = effectiveDirective;
            BlockedURL = blockedURL;
            OriginalPolicy = originalPolicy;
            StatusCode = statusCode;
            Sample = sample;
            SourceFile = sourceFile;
            LineNumber = lineNumber;
            ColumnNumber = columnNumber;
        }

        public ReportToBody(CspReport cspReport)
        {
            DocumentURL = cspReport.DocumentUri;
            Disposition = cspReport.Disposition;
            Referrer = cspReport.Referrer;
            EffectiveDirective = cspReport.EffectiveDirective;
            BlockedURL = cspReport.BlockedUri;
            OriginalPolicy = cspReport.OriginalPolicy;
            StatusCode = cspReport.StatusCode;
            Sample = "";
            SourceFile = "";
            LineNumber = 1;
            ColumnNumber = cspReport.ColumnNumber;
        }

        [JsonPropertyName("documentURL")]
        public string? DocumentURL { get; }

        [JsonPropertyName("disposition")]
        public string? Disposition { get; }

        [JsonPropertyName("referrer")]
        public string? Referrer { get; }

        [JsonPropertyName("effectiveDirective")]
        public string? EffectiveDirective { get; }

        [JsonPropertyName("blockedURL")]
        public string? BlockedURL { get; }

        [JsonPropertyName("originalPolicy")]
        public string? OriginalPolicy { get; }

        [JsonPropertyName("statusCode")]
        public int? StatusCode { get; }

        [JsonPropertyName("sample")]
        public string? Sample { get; }

        [JsonPropertyName("sourceFile")]
        public string? SourceFile { get; }

        [JsonPropertyName("lineNumber")]
        public int? LineNumber { get; }

        [JsonPropertyName("columnNumber")]
        public int? ColumnNumber { get; }
    }
}