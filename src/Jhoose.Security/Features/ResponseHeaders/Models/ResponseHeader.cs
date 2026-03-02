using System;
using System.Text.Json.Serialization;

using Jhoose.Security.Features.Core.Model;

namespace Jhoose.Security.Features.ResponseHeaders.Models;


[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonDerivedType(typeof(StrictTransportSecurityHeader), nameof(StrictTransportSecurityHeader))]
[JsonDerivedType(typeof(XFrameOptionsHeader), nameof(XFrameOptionsHeader))]
[JsonDerivedType(typeof(XContentTypeOptionsHeader), nameof(XContentTypeOptionsHeader))]
[JsonDerivedType(typeof(ReferrerPolicyHeader), nameof(ReferrerPolicyHeader))]
[JsonDerivedType(typeof(XPermittedCrossDomainPoliciesHeader), nameof(XPermittedCrossDomainPoliciesHeader))]
[JsonDerivedType(typeof(CrossOriginEmbedderPolicyHeader), nameof(CrossOriginEmbedderPolicyHeader))]
[JsonDerivedType(typeof(CrossOriginOpenerPolicyHeader), nameof(CrossOriginOpenerPolicyHeader))]
[JsonDerivedType(typeof(CrossOriginResourcePolicyHeader), nameof(CrossOriginResourcePolicyHeader))]
public class ResponseHeader : IResponseHeader , ISitePolicy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public bool Enabled { get; set; } = true;
    public string Site
    {
        get => string.IsNullOrEmpty(field) ? "*" : field;
        set => field = value ?? string.Empty;
    }

    public virtual string Name { get; set; } = string.Empty;
    public virtual string Value { get; set; } = string.Empty;

    public string GroupingKey => this.Name;


    protected static string NormalizeHost(string host)
    {
        if (string.IsNullOrWhiteSpace(host))
        {
            return string.Empty;
        }

        var trimmed = host.Trim();
        if (trimmed.IndexOf("://", StringComparison.Ordinal) < 0)
        {
            trimmed = $"https://{trimmed}";
        }

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri))
        {
            return string.Empty;
        }

        var scheme = uri.Scheme;
        if (!scheme.Equals("http", StringComparison.OrdinalIgnoreCase)
            && !scheme.Equals("https", StringComparison.OrdinalIgnoreCase))
        {
            return string.Empty;
        }

        var baseUri = uri.GetLeftPart(UriPartial.Authority);
        return baseUri.EndsWith("/", StringComparison.Ordinal) ? baseUri : $"{baseUri}/";
    }
}
