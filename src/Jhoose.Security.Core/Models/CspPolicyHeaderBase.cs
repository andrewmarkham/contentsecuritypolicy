using System.Collections.Generic;
using System.Text;

namespace Jhoose.Security.Core.Models
{
    public abstract class CspPolicyHeaderBase : ResponseHeader
    {
        protected readonly string reportUrl;

        protected CspPolicyHeaderBase(string reportUrl)
        {
            this.reportUrl = reportUrl;
        }

        protected virtual string BuildValue(string reportUrl, string nonceValue)
        {

            var sb = new StringBuilder();
            this.Policies.ForEach(p => sb.Append(p.ToString()));

            if (!(string.IsNullOrEmpty(reportUrl)))
            {
                sb.Append($" report-uri {reportUrl}; ");
                sb.Append($" report-to main-endpoint; ");
            }

            return string.Format(sb.ToString(), nonceValue);
        }

        public string NonceValue { get; set; }
        public List<CspPolicy> Policies { get; set; }

        public override string Value => this.BuildValue(this.reportUrl, this.NonceValue);
    }
}