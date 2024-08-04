//using Newtonsoft.Json;

using System.Text.Json.Serialization;

namespace Jhoose.Security.Reporting.Models
{
    public class CspReport
    {
        [JsonConstructor]
        public CspReport(
            string blockedUri,
            int? columnNumber,
            string disposition,
            string documentUri,
            string effectiveDirective,
            string originalPolicy,
            string referrer,
            int? statusCode,
            string violatedDirective
        )
        {
            BlockedUri = blockedUri;
            ColumnNumber = columnNumber;
            Disposition = disposition;
            DocumentUri = documentUri;
            EffectiveDirective = effectiveDirective;
            OriginalPolicy = originalPolicy;
            Referrer = referrer;
            StatusCode = statusCode;
            ViolatedDirective = violatedDirective;
        }

        [JsonPropertyName("blocked-uri")]
        public string BlockedUri { get; }

        [JsonPropertyName("column-number")]
        public int? ColumnNumber { get; }

        [JsonPropertyName("disposition")]
        public string Disposition { get; }

        [JsonPropertyName("document-uri")]
        public string DocumentUri { get; }

        [JsonPropertyName("effective-directive")]
        public string EffectiveDirective { get; }

        [JsonPropertyName("original-policy")]
        public string OriginalPolicy { get; }

        [JsonPropertyName("referrer")]
        public string Referrer { get; }

        [JsonPropertyName("status-code")]
        public int? StatusCode { get; }

        [JsonPropertyName("violated-directive")]
        public string ViolatedDirective { get; }
    }
}