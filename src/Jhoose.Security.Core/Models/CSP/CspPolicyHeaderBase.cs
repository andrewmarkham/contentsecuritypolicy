using System.Collections.Generic;
using System.Text;

namespace Jhoose.Security.Core.Models.CSP
{
    public abstract class CspPolicyHeaderBase : ResponseHeader
    {
        protected readonly CspSettings settings;

        protected readonly string reportUrl;
        protected readonly string reportToUrl;

        protected CspPolicyHeaderBase(CspSettings settings, string host)
        {
            this.settings = settings;

            switch (this.settings.ReportingMode)
            {
                case ReportingMode.Local:
                    this.reportUrl = $"{host}api/reporting/";
                    this.reportToUrl = $"{host}api/reporting/";
                    break;
                case ReportingMode.External:
                    this.reportUrl = this.settings.ReportingUrl;
                    this.reportToUrl = this.settings.ReportToUrl;
                    break;
                default:
                    this.reportUrl = string.Empty;
                    this.reportToUrl = string.Empty;
                    break;
            }
        }

        protected virtual string BuildValue(string reportUrl, string? nonceValue)
        {
            var sb = new StringBuilder();
            this.Policies?.ForEach(p => sb.Append(p.ToString()));

            if (!string.IsNullOrEmpty(reportUrl))
            {
                sb.Append(" report-uri ").Append(reportUrl).Append("; ");

                if (!string.IsNullOrEmpty(this.reportToUrl))
                {
                    sb.Append(" report-to csp-endpoint; ");
                }
            }

            return string.Format(sb.ToString(), nonceValue);
        }

        public string? NonceValue { get; set; }
        public List<CspPolicy>? Policies { get; set; }

        public override string Value => this.BuildValue(this.reportUrl, this.NonceValue);
    }
}