namespace Jhoose.Security.Core.Models.CSP;

public class PermissionsPolicyReportHeader : PermissionsPolicyHeaderBase
{
    public PermissionsPolicyReportHeader(CspSettings settings, string host) : base(settings, host)
    {
    }

    public override string Name => "Permissions-Policy-Report-Only";
}
