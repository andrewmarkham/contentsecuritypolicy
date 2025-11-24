using Jhoose.Security.Core.Models.CSP;

namespace Jhoose.Security.Core.Models;

public class ReportingEndpointHeader(CspSettings settings, string host, string name) : CspPolicyHeaderBase(settings, host)
{
    public override string Name => "Reporting-Endpoints";

    public override string Value => $"{name}=\"{this.reportToUrl}\", default=\"{this.reportToUrl}\"";
}