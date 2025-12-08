using Jhoose.Security.Models.CSP;

namespace Jhoose.Security.Models;

public class ReportingEndpointHeader(CspSettings settings, string host, string name) : CspPolicyHeaderBase(settings, host)
{
    public override string Name => "Reporting-Endpoints";

    public override string Value => $"{name}=\"{this.reportToUrl}\", default=\"{this.reportToUrl}\"";
}