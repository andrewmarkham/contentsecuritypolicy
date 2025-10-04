using System.Collections.Generic;

using Jhoose.Security.Core.Models.CSP;

namespace Jhoose.Security.Core.Models.Export;

public record JhoooseSecurityExport
{
    public string IntegrityHash { get; set; } = string.Empty;

    public ExportMetadata Metadata { get; init; } = new ExportMetadata();
    public CspSettings? CspSettings { get; init; }
    public List<CspPolicy>? CspPolicies { get; init; }
    public List<ResponseHeader>? ResponseHeaders { get; init; }

}