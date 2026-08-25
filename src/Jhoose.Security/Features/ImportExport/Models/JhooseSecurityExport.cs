using System.Collections.Generic;

using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.IpRestrictions.Models;
using Jhoose.Security.Features.Permissions.Models;
using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.Settings.Models;

namespace Jhoose.Security.Features.ImportExport.Models;

public record JhoooseSecurityExport
{
    public string IntegrityHash { get; set; } = string.Empty;

    public ExportMetadata Metadata { get; init; } = new ExportMetadata();
    public CspSettings? CspSettings { get; init; }
    public List<CspPolicy>? CspPolicies { get; init; }
    public List<PermissionPolicy>? Permissions { get; init; }
    public List<ResponseHeader>? ResponseHeaders { get; init; }
    public List<IpRestrictionEntry>? IpRestrictions { get; init; }
    public List<IpRestrictionIgnoredPath>? IpRestrictionIgnoredPaths { get; init; }
    public List<IpRestrictionIgnoreHeader>? IpRestrictionIgnoreHeaders { get; init; }

    public List<ContentLinkReference>? CspContentReferences { get; init; }
    public List<ContentLinkReference>? PermissionsContentReferences { get; init; }

}