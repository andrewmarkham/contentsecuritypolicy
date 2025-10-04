using System.Text.Json.Serialization;

namespace Jhoose.Security.Reporting.Models.Search;

public class BodyData
{
    [JsonPropertyName("documentURL")]
    public string DocumentUrl { get; set; } = string.Empty;

    public string Disposition { get; set; } = string.Empty;
    public string Referrer { get; set; } = string.Empty;

    [JsonPropertyName("effectiveDirective")]
    public string EffectiveDirective { get; set; } = string.Empty;

    [JsonPropertyName("blockedURL")]
    public string BlockedUrl { get; set; } = string.Empty;

    [JsonPropertyName("originalPolicy")]
    public string OriginalPolicy { get; set; } = string.Empty;

    public int StatusCode { get; set; }
    public string Sample { get; set; } = string.Empty;

    [JsonPropertyName("sourceFile")]
    public string SourceFile { get; set; } = string.Empty;

    [JsonPropertyName("lineNumber")]
    public int LineNumber { get; set; }

    [JsonPropertyName("columnNumber")]
    public int ColumnNumber { get; set; }
}