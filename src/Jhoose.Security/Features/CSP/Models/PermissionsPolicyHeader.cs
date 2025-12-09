using Jhoose.Security.Features.Settings.Models;

namespace Jhoose.Security.Features.CSP.Models;

public class PermissionsPolicyHeader(CspSettings settings, string host) : PermissionsPolicyHeaderBase(settings, host)
{
    public override string Name => "Permissions-Policy";
}