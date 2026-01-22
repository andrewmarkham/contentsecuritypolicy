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


public sealed class CspReportToBody : IReportToBody
{
    [JsonConstructor]
    public CspReportToBody(string? documentURL, string? disposition, string? referrer,
        string? effectiveDirective, string? blockedURL, string? originalPolicy,
        int? statusCode, string? sample)
        => (DocumentURL, Disposition, Referrer, EffectiveDirective, BlockedURL, OriginalPolicy, StatusCode, Sample)
         = (documentURL, disposition, referrer, effectiveDirective, blockedURL, originalPolicy, statusCode, sample);

    [JsonPropertyName("documentURL")] public string? DocumentURL { get; }
    [JsonPropertyName("disposition")] public string? Disposition { get; }
    [JsonPropertyName("referrer")] public string? Referrer { get; }
    [JsonPropertyName("effectiveDirective")] public string? EffectiveDirective { get; }
    [JsonPropertyName("blockedURL")] public string? BlockedURL { get; }
    [JsonPropertyName("originalPolicy")] public string? OriginalPolicy { get; }
    [JsonPropertyName("statusCode")] public int? StatusCode { get; }
    [JsonPropertyName("sample")] public string? Sample { get; }

    public string? Directive => EffectiveDirective;
    public string? Message => BlockedURL;
}

public sealed class PermissionsReportToBody : IReportToBody
{
    [JsonConstructor]
    public PermissionsReportToBody(
        string? disposition,
        string? policyId,
        string? message,
        string? sourceFile,
        int? lineNumber,
        int? columnNumber)
        => (Disposition, PolicyId, Message, SourceFile, LineNumber, ColumnNumber)
         = (disposition, policyId, message, sourceFile, lineNumber, columnNumber);

    [JsonPropertyName("disposition")] public string? Disposition { get; }
    [JsonPropertyName("policyId")] public string? PolicyId { get; }
    [JsonPropertyName("message")] public string? Message { get; }
    [JsonPropertyName("sourceFile")] public string? SourceFile { get; }
    [JsonPropertyName("lineNumber")] public int? LineNumber { get; }
    [JsonPropertyName("columnNumber")] public int? ColumnNumber { get; }

    public string? Directive => PolicyId;

    // Satisfy IReportToBody (your interface requires it)
    string? IReportToBody.Message => Message;
}

public sealed class DeprecationReportToBody : IReportToBody
{
    [JsonConstructor]
    public DeprecationReportToBody(
        string? id,
        int? lineNumber,
        int? columnNumber,
        string? message,
        string? sourceFile)
        => (Id, LineNumber, ColumnNumber, Message, SourceFile)
         = (id, lineNumber, columnNumber, message, sourceFile);

    [JsonPropertyName("id")] public string? Id { get; }
    [JsonPropertyName("lineNumber")] public int? LineNumber { get; }
    [JsonPropertyName("columnNumber")] public int? ColumnNumber { get; }
    [JsonPropertyName("message")] public string? Message { get; }
    [JsonPropertyName("sourceFile")] public string? SourceFile { get; }

    public string? Directive => Id;

    // satisfy interface
    string? IReportToBody.Message => Message;
}