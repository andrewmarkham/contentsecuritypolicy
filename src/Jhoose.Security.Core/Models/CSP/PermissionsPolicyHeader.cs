namespace Jhoose.Security.Core.Models.CSP;

public class PermissionsPolicyHeader(CspSettings settings, string host) : PermissionsPolicyHeaderBase(settings, host)
{
    public override string Name => "Permissions-Policy";
}