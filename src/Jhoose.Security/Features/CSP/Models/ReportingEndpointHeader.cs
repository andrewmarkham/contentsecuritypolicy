using Jhoose.Security.Features.Settings.Models;

namespace Jhoose.Security.Features.CSP.Models;

public class ReportingEndpointHeader(CspSettings settings, string host, string name) : CspPolicyHeaderBase(settings, host)
{
    public override string Name => "Reporting-Endpoints";

    public override string Value => $"{name}=\"{this.reportToUrl}\", default=\"{this.reportToUrl}\"";
}