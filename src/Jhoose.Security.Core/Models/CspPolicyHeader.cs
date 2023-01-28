using System.Collections.Generic;
using System.Text;

namespace Jhoose.Security.Core.Models
{

    public class CspPolicyHeader : CspPolicyHeaderBase
    {
        public CspPolicyHeader(string reportUrl) : base(reportUrl)
        {
        }

        public override string Name => "Content-Security-Policy";
    }


    public class ReportingEndpointHeader : CspPolicyHeaderBase
    {
        public ReportingEndpointHeader(string reportUrl) : base(reportUrl)
        {
        }

        public override string Name => "Reporting-Endpoints";

        public override string Value => $"main-endpoint=\"{this.reportUrl}\", default=\"{this.reportUrl}\"";
    }
}