using Jhoose.Security.Core.Models.CSP;

namespace Jhoose.Security.Core.Models;

public class ReportToHeader(CspSettings settings, string host, string group) : CspPolicyHeaderBase(settings, host)
{
    public override string Name => "Report-To";


    public override string Value => $"{{ \"group\": \"{group}\",\"max_age\": 10886400,\"endpoints\": [{{ \"url\": \"{this.reportToUrl}\" }}] }}";
}