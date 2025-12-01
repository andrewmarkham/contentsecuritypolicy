using System;
using System.Text.Json.Serialization;

using Jhoose.Security.Core.Models.SecurityHeaders;

namespace Jhoose.Security.Core.Models;


[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonDerivedType(typeof(StrictTransportSecurityHeader), nameof(StrictTransportSecurityHeader))]
[JsonDerivedType(typeof(XFrameOptionsHeader), nameof(XFrameOptionsHeader))]
[JsonDerivedType(typeof(XContentTypeOptionsHeader), nameof(XContentTypeOptionsHeader))]
[JsonDerivedType(typeof(ReferrerPolicyHeader), nameof(ReferrerPolicyHeader))]
[JsonDerivedType(typeof(XPermittedCrossDomainPoliciesHeader), nameof(XPermittedCrossDomainPoliciesHeader))]
[JsonDerivedType(typeof(CrossOriginEmbedderPolicyHeader), nameof(CrossOriginEmbedderPolicyHeader))]
[JsonDerivedType(typeof(CrossOriginOpenerPolicyHeader), nameof(CrossOriginOpenerPolicyHeader))]
[JsonDerivedType(typeof(CrossOriginResourcePolicyHeader), nameof(CrossOriginResourcePolicyHeader))]
public class ResponseHeader : IResponseHeader
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public bool Enabled { get; set; } = true;

    public virtual string Name { get; set; } = string.Empty;
    public virtual string Value { get; set; } = string.Empty;
}