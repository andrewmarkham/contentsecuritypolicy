using System.Collections.Generic;
using Jhoose.Security.Core.Models;

namespace Jhoose.Security
{
    public class SecurityOptions
    {
        public const string JhooseSecurity = "JhooseSecurity";
        public List<string> ExclusionPaths { get; set; } = new List<string> { "/episerver" };
        public bool HttpsRedirection {get;set;} = true;
        public StrictTransportSecurityHeader StrictTransportSecurity {get;set;} = new StrictTransportSecurityHeader();
        public XFrameOptionsHeader XFrameOptions {get;set;} = new XFrameOptionsHeader();
        public XContentTypeOptionsHeader XContentTypeOptions {get;set;} = new XContentTypeOptionsHeader();
        public XPermittedCrossDomainPoliciesHeader XPermittedCrossDomainPolicies {get;set;} = new XPermittedCrossDomainPoliciesHeader();
        public ReferrerPolicyHeader ReferrerPolicy {get;set;} = new ReferrerPolicyHeader();
        public CrossOriginEmbedderPolicyHeader CrossOriginEmbedderPolicy {get;set;} = new CrossOriginEmbedderPolicyHeader();
        public CrossOriginOpenerPolicyHeader CrossOriginOpenerPolicy {get;set;} = new CrossOriginOpenerPolicyHeader();
        public CrossOriginResourcePolicyHeader CrossOriginResourcePolicy{get;set;} = new CrossOriginResourcePolicyHeader();

        public IEnumerable<ResponseHeader> Headers {
            get {
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