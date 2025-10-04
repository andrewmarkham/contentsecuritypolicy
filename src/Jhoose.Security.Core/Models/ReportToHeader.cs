using Jhoose.Security.Core.Models.CSP;

namespace Jhoose.Security.Core.Models;

public class ReportToHeader : CspPolicyHeaderBase
{
    public ReportToHeader(CspSettings settings, string host) : base(settings, host)
    {
    }

    public override string Name => "Report-To";


    public override string Value => $"{{ \"group\": \"csp-endpoint\",\"max_age\": 10886400,\"endpoints\": [{{ \"url\": \"{this.reportToUrl}\" }}] }}";
}