using System.Text.Json.Serialization;

namespace Jhoose.Security.Reporting.Models.Search
{
    public class BodyData
        {
            [JsonPropertyName("documentURL")]
            public string DocumentUrl { get; set; }

            public string Disposition { get; set; }
            public string Referrer { get; set; }

            [JsonPropertyName("effectiveDirective")]
            public string EffectiveDirective { get; set; }

            [JsonPropertyName("blockedURL")]
            public string BlockedUrl { get; set; }

            [JsonPropertyName("originalPolicy")]
            public string OriginalPolicy { get; set; }

            public int StatusCode { get; set; }
            public string Sample { get; set; }

            [JsonPropertyName("sourceFile")]
            public string SourceFile { get; set; }

            [JsonPropertyName("lineNumber")]
            public int LineNumber { get; set; }

            [JsonPropertyName("columnNumber")]
            public int ColumnNumber { get; set; }
        }
}

