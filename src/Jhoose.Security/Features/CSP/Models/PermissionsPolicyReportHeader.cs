using Jhoose.Security.Features.Settings.Models;

namespace Jhoose.Security.Features.CSP.Models;

public class PermissionsPolicyReportHeader : PermissionsPolicyHeaderBase
{
    public PermissionsPolicyReportHeader(CspSettings settings, string host) : base(settings, host)
    {
    }

    public override string Name => "Permissions-Policy-Report-Only";
}
