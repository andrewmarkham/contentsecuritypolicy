using Jhoose.Security.Features.Settings.Models;

namespace Jhoose.Security.Features.CSP.Models;

public class CspPolicyReportHeader : CspPolicyHeaderBase
{
    public CspPolicyReportHeader(CspSettings settings, string host) : base(settings, host)
    {
    }

    public override string Name => "Content-Security-Policy-Report-Only";
}
