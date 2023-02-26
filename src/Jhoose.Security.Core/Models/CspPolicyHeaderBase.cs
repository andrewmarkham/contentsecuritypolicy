using System.Collections.Generic;
using System.Text;

namespace Jhoose.Security.Core.Models
{
    public abstract class CspPolicyHeaderBase : ResponseHeader
    {
        protected readonly CspSettings settings;

        protected CspPolicyHeaderBase(CspSettings settings)
        {
            this.settings = settings;
        }

        protected virtual string BuildValue(string reportUrl, string nonceValue)
        {

            var sb = new StringBuilder();
            this.Policies.ForEach(p => sb.Append(p.ToString()));

            if (!(string.IsNullOrEmpty(reportUrl)))
            {
                sb.Append($" report-uri {reportUrl}; ");

                if (!string.IsNullOrEmpty(this.settings.ReportToUrl))
                {
                    sb.Append($" report-to csp-endpoint; ");
                }
            }

            return string.Format(sb.ToString(), nonceValue);
        }

        public string NonceValue { get; set; }
        public List<CspPolicy> Policies { get; set; }

        public override string Value => this.BuildValue(this.settings.ReportingUrl, this.NonceValue);
    }
}