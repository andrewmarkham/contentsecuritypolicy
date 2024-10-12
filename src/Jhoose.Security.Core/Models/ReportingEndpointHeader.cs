using Jhoose.Security.Core.Models.CSP;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Jhoose.Security.Core.Models
{
    public class ReportingEndpointHeader : CspPolicyHeaderBase
    {
        public ReportingEndpointHeader(CspSettings settings, string host) : base(settings, host)
        {
        }

        public override string Name => "Reporting-Endpoints";

        public override string Value => $"csp-endpoint=\"{this.reportToUrl}\", default=\"{this.reportToUrl}\"";
    }
}