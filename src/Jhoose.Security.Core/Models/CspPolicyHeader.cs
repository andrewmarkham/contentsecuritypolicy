using System.Collections.Generic;
using System.Text;

namespace Jhoose.Security.Core.Models
{
    public class CspPolicyHeader
    {
        public static string HeaderName = "Content-Security-Policy";
        public static string ReadonlyHeaderName = "Content-Security-Policy-Report-Only";
        
        public CspPolicyHeader()
        {
        }

        public string Header {get;set;}
        public string BuildValue(string reportUrl, string nonceValue) 
        { 

            StringBuilder sb = new StringBuilder();
            this.Policies.ForEach(p => sb.Append(p.ToString()));

            if (!(string.IsNullOrEmpty(reportUrl))) {
                sb.Append($" report-uri {reportUrl}; ");
                sb.Append( $" report-to {reportUrl}; ");
            }

            return string.Format(sb.ToString(), nonceValue); 
        }

        public List<CspPolicy> Policies {get;set;}
    }
}