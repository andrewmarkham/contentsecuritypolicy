using System.Collections.Generic;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.SecurityHeaders;

#if NET461_OR_GREATER
using System.Configuration;
#endif

namespace Jhoose.Security
{
    public class JhooseSecurityOptions
    {
        public JhooseSecurityOptions()
        {
            HttpsRedirection = true;
            StrictTransportSecurity = new StrictTransportSecurityHeader();
            XFrameOptions = new XFrameOptionsHeader();
            XContentTypeOptions = new XContentTypeOptionsHeader();
            XPermittedCrossDomainPolicies = new XPermittedCrossDomainPoliciesHeader();
            ReferrerPolicy = new ReferrerPolicyHeader();
            CrossOriginEmbedderPolicy = new CrossOriginEmbedderPolicyHeader();
            CrossOriginOpenerPolicy = new CrossOriginOpenerPolicyHeader();
            CrossOriginResourcePolicy = new CrossOriginResourcePolicyHeader();
        }
        public const string JhooseSecurity = "JhooseSecurity";
        public List<string> ExclusionPaths { get; set; } = new List<string> { "/episerver" };
        public bool HttpsRedirection { get; set; }
        public StrictTransportSecurityHeader StrictTransportSecurity { get; set; }
        public XFrameOptionsHeader XFrameOptions { get; set; }
        public XContentTypeOptionsHeader XContentTypeOptions { get; set; }
        public XPermittedCrossDomainPoliciesHeader XPermittedCrossDomainPolicies { get; set; }
        public ReferrerPolicyHeader ReferrerPolicy { get; set; }
        public CrossOriginEmbedderPolicyHeader CrossOriginEmbedderPolicy { get; set; }
        public CrossOriginOpenerPolicyHeader CrossOriginOpenerPolicy { get; set; }
        public CrossOriginResourcePolicyHeader CrossOriginResourcePolicy { get; set; }

        public IEnumerable<ResponseHeader> Headers
        {
            get
            {
                yield return this.StrictTransportSecurity;
                yield return this.XFrameOptions;
                yield return this.XContentTypeOptions;
                yield return this.XPermittedCrossDomainPolicies;
                yield return this.ReferrerPolicy;
                yield return this.CrossOriginEmbedderPolicy;
                yield return this.CrossOriginOpenerPolicy;
                yield return this.CrossOriginResourcePolicy;
            }
        }
    }
}

