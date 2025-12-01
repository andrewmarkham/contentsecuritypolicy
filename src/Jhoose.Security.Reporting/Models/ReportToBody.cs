using System.Text.Json.Serialization;

namespace Jhoose.Security.Reporting.Models;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(CspReportToBody), "csp")]
[JsonDerivedType(typeof(PermissionsReportToBody), "permissions")]
[JsonDerivedType(typeof(DeprecationReportToBody), "deprecation")]
public interface IReportToBody
{
    string? Directive { get; }
    string? Message { get; }
}

public record CspReportToBody([property: JsonPropertyName("documentURL")] string? DocumentURL, 
[property: JsonPropertyName("disposition")] string? Disposition, 
[property: JsonPropertyName("referrer")] string? Referrer, 
[property: JsonPropertyName("effectiveDirective")] string? EffectiveDirective, 
[property: JsonPropertyName("blockedURL")] string? BlockedURL, 
[property: JsonPropertyName("originalPolicy")] string? OriginalPolicy, 
[property: JsonPropertyName("statusCode")] int? StatusCode, 
[property: JsonPropertyName("sample")] string? Sample) : IReportToBody
//[property: JsonPropertyName("message")] string? Message, 
//[property: JsonPropertyName("policyId")] string? PolicyId)
{
    public string? Directive => EffectiveDirective;
    public string? Message => BlockedURL;
}

public record PermissionsReportToBody([property: JsonPropertyName("disposition")] string? Disposition, [property: JsonPropertyName("policyId")] string? PolicyId, [property: JsonPropertyName("message")] string? Message, [property: JsonPropertyName("sourceFile")] string? SourceFile, [property: JsonPropertyName("lineNumber")] int? LineNumber, [property: JsonPropertyName("columnNumber")] int? ColumnNumber) : IReportToBody
{
    public string? Directive => PolicyId;
    //public string? Message => Message;
}

public record DeprecationReportToBody([property: JsonPropertyName("id")] string? Id, [property: JsonPropertyName("lineNumber")] int? LineNumber, [property: JsonPropertyName("columnNumber")] int? ColumnNumber, [property: JsonPropertyName("message")] string? Message, [property: JsonPropertyName("sourceFile")] string? SourceFile) : IReportToBody
{
    public string? Directive => Id;
    //public string? Message => Message;
};