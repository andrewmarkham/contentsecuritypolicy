using System;
using System.Linq;

using Jhoose.Security.Core.Models;

using Jhoose.Security.Core.Models.SecurityHeaders;

namespace Jhoose.Security.Repository;

/// <summary>
/// Helper class to fix response headers deserialization issues.
/// This is necessary because of a bug intriduced in V2.5 see https://github.com/andrewmarkham/contentsecuritypolicy/issues/145
/// </summary>
public class FixResponseHeaderHelper
{
    /// <summary>
    /// Determines if a fix is required based on the type name.
    /// </summary>
    /// <param name="deserializedHeader"></param>
    /// <param name="typeName"></param>
    /// <returns></returns>
    public static bool IsFixRequired(ResponseHeader deserializedHeader, string typeName)
    {
        return deserializedHeader.GetType() == typeof(ResponseHeader) ? true : GetType(typeName) == typeof(ResponseHeader);
    }
    /// <summary>
    /// Fixes the response type based on the original header name.
    /// </summary>
    /// <param name="originalHeader"></param>
    /// <param name="jsonValue"></param>
    /// <returns></returns>
    public static ResponseHeader ApplyFix(ResponseHeader? originalHeader, string jsonValue)
    {
        switch (originalHeader?.Name)
        {
            case "Strict-Transport-Security":
                var strictTransportSecurityHeader = System.Text.Json.JsonSerializer.Deserialize<StrictTransportSecurityHeader>(jsonValue);

                strictTransportSecurityHeader!.IncludeSubDomains = originalHeader.Value.Contains("includeSubDomains", StringComparison.InvariantCultureIgnoreCase);
                strictTransportSecurityHeader!.MaxAge = int.Parse(originalHeader.Value.Split(';')[0].Replace("max-age=", "").Trim());

                return strictTransportSecurityHeader!;
            case "X-Frame-Options":
                var xFrameOptionsHeader = System.Text.Json.JsonSerializer.Deserialize<XFrameOptionsHeader>(jsonValue);

                    if (originalHeader.Value.Equals("deny", StringComparison.InvariantCultureIgnoreCase))
                    {
                        xFrameOptionsHeader!.Mode = XFrameOptionsEnum.Deny;
                    }
                    else if (originalHeader.Value.Equals("sameorigin", StringComparison.InvariantCultureIgnoreCase))
                    {
                        xFrameOptionsHeader!.Mode = XFrameOptionsEnum.SameOrigin;
                    }
                    else if (originalHeader.Value.StartsWith("allow-from", StringComparison.InvariantCultureIgnoreCase))
                    {
                        xFrameOptionsHeader!.Mode = XFrameOptionsEnum.AllowFrom;
                        var parts = originalHeader.Value.Split(':');
                        if (parts.Length > 1)
                        {
                            xFrameOptionsHeader!.Domain = parts[1].Trim();
                        }
                    }
                    else
                    {
                        xFrameOptionsHeader!.Mode = XFrameOptionsEnum.Deny;
                    }
                return xFrameOptionsHeader!;
            case "X-Content-Type-Options":
                var xContentTypeOptionsHeader = System.Text.Json.JsonSerializer.Deserialize<XContentTypeOptionsHeader>(jsonValue);
                return xContentTypeOptionsHeader!;
            case "X-Permitted-Cross-Domain-Policies":
                var xPermittedCrossDomainPoliciesHeader = System.Text.Json.JsonSerializer.Deserialize<XPermittedCrossDomainPoliciesHeader>(jsonValue);
                xPermittedCrossDomainPoliciesHeader!.Mode = originalHeader.Value switch
                {
                    "none" => XPermittedCrossDomainPoliciesEnum.None,
                    "master-only" => XPermittedCrossDomainPoliciesEnum.MasterOnly,
                    "by-content-type" => XPermittedCrossDomainPoliciesEnum.ByContentType,
                    "all" => XPermittedCrossDomainPoliciesEnum.All,
                    _ => XPermittedCrossDomainPoliciesEnum.None,
                };
                return xPermittedCrossDomainPoliciesHeader!;
            case "Referrer-Policy":
                var referrerPolicyHeader = System.Text.Json.JsonSerializer.Deserialize<ReferrerPolicyHeader>(jsonValue);
                referrerPolicyHeader!.Mode = originalHeader.Value switch
                {
                    "no-referrer" => ReferrerPolicyEnum.NoReferrer,
                    "no-referrer-when-downgrade" => ReferrerPolicyEnum.NoReferrerWhenDownGrade,
                    "origin" => ReferrerPolicyEnum.Origin,
                    "origin-when-cross-origin" => ReferrerPolicyEnum.OriginWhenCrossOrigin,
                    "same-origin" => ReferrerPolicyEnum.SameOrigin,
                    "strict-origin" => ReferrerPolicyEnum.StrictOrigin,
                    "strict-origin-when-cross-origin" => ReferrerPolicyEnum.StrictOriginWhenCrossOrigin,
                    "unsafe-url" => ReferrerPolicyEnum.UnsafeUrl,
                    _ => ReferrerPolicyEnum.NoReferrer,
                };
                return referrerPolicyHeader!;
            case "Cross-Origin-Embedder-Policy":
                var crossOriginEmbedderPolicyHeader = System.Text.Json.JsonSerializer.Deserialize<CrossOriginEmbedderPolicyHeader>(jsonValue);
                crossOriginEmbedderPolicyHeader!.Mode = originalHeader.Value switch
                {
                    "unsafe-none" => CrossOriginEmbedderPolicyEnum.UnSafeNone,
                    "require-corp" => CrossOriginEmbedderPolicyEnum.RequireCorp,
                    _ => CrossOriginEmbedderPolicyEnum.UnSafeNone,
                };
                return crossOriginEmbedderPolicyHeader!;
            case "Cross-Origin-Opener-Policy":
                var crossOriginOpenerPolicyHeader = System.Text.Json.JsonSerializer.Deserialize<CrossOriginOpenerPolicyHeader>(jsonValue);
                crossOriginOpenerPolicyHeader!.Mode = originalHeader.Value switch
                {
                    "unsafe-none" => CrossOriginOpenerPolicyEnum.UnSafeNone,
                    "same-origin" => CrossOriginOpenerPolicyEnum.SameOrigin,
                    "same-origin-allow-popups" => CrossOriginOpenerPolicyEnum.SameOriginAllowPopups,
                    _ => CrossOriginOpenerPolicyEnum.UnSafeNone,
                };
                return crossOriginOpenerPolicyHeader!;
            case "Cross-Origin-Resource-Policy":
                var crossOriginResourcePolicyHeader = System.Text.Json.JsonSerializer.Deserialize<CrossOriginResourcePolicyHeader>(jsonValue);
                crossOriginResourcePolicyHeader!.Mode = originalHeader.Value switch
                {
                    "same-origin" => CrossOriginResourcePolicyEnum.SameOrigin,
                    "same-site" => CrossOriginResourcePolicyEnum.SameSite,
                    "cross-origin" => CrossOriginResourcePolicyEnum.CrossOrigin,
                    _ => CrossOriginResourcePolicyEnum.SameOrigin,
                };
                return crossOriginResourcePolicyHeader!;
            default:
                return originalHeader!;
        }
    }

    private static Type GetType(string typeName)
    {
        return Type.GetType(typeName, assemblyName =>
            {
                return AppDomain.CurrentDomain.GetAssemblies().SingleOrDefault(a => a.GetName().Name == assemblyName.Name);
            },
            (assembly, typeName, caseInsensitive) =>
            {
                if (caseInsensitive)
                    return assembly?.GetTypes().SingleOrDefault(t => t.FullName?.Equals(typeName, StringComparison.InvariantCultureIgnoreCase) ?? false);
                else
                    return assembly?.GetTypes().SingleOrDefault(t => t.FullName == typeName);
            })!;
    }
}