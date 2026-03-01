using Jhoose.Security.Features.Settings.Models;

namespace Jhoose.Security.Features.CSP.Models;


public class CspPolicyHeader(CspSettings settings, string host) : CspPolicyHeaderBase(settings, host)
{
    public override string Name => "Content-Security-Policy";
}
