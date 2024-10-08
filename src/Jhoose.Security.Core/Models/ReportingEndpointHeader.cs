﻿using Jhoose.Security.Core.Models.CSP;

namespace Jhoose.Security.Core.Models
{
    public class ReportingEndpointHeader : CspPolicyHeaderBase
    {
        public ReportingEndpointHeader(CspSettings settings) : base(settings)
        {
        }

        public override string Name => "Reporting-Endpoints";

        public override string Value => $"csp-endpoint=\"{this.reportToUrl}\", default=\"{this.reportToUrl}\"";
    }
}