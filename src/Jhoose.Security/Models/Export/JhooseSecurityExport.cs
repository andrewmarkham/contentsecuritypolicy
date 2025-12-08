using System.Collections.Generic;

using Jhoose.Security.Models.CSP;
using Jhoose.Security.Models.Permissions;

namespace Jhoose.Security.Models.Export;

public record JhoooseSecurityExport
{
    public string IntegrityHash { get; set; } = string.Empty;

    public ExportMetadata Metadata { get; init; } = new ExportMetadata();
    public CspSettings? CspSettings { get; init; }
    public List<CspPolicy>? CspPolicies { get; init; }
    public List<PermissionPolicy>? Permissions { get; init; }
    public List<ResponseHeader>? ResponseHeaders { get; init; }

}