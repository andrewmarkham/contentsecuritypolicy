namespace Jhoose.Security.Core.Models.CSP;


public class CspPolicyHeader(CspSettings settings, string host) : CspPolicyHeaderBase(settings, host)
{
    public override string Name => "Content-Security-Policy";
}
