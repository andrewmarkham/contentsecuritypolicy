
#if NET461
using Jhoose.Security.Core.Models;
using System.Collections.Generic;
using System.Configuration;

namespace Jhoose.Security.Configuration
{

    public class HeadersSection : ConfigurationSection
    {
        [ConfigurationProperty("StrictTransportSecurityHeader", IsRequired = false)]
        public StrictTransportSecurityHeaderElement StrictTransportSecurity
        {
            get { return (StrictTransportSecurityHeaderElement)this["StrictTransportSecurityHeader"]; }
        }

        [ConfigurationProperty("XFrameOptionsHeader", IsRequired = false)]
        public XFrameOptionsHeaderElement XFrameOptionsHeader
        {
            get { return (XFrameOptionsHeaderElement)this["XFrameOptionsHeader"]; }
        }

        [ConfigurationProperty("XContentTypeOptionsHeader", IsRequired = false)]
        public XContentTypeOptionsHeaderElement XContentTypeOptionsHeader
        {
            get { return (XContentTypeOptionsHeaderElement)this["XContentTypeOptionsHeader"]; }
        }

        [ConfigurationProperty("XPermittedCrossDomainPoliciesHeader", IsRequired = false)]
        public XPermittedCrossDomainPoliciesHeaderElement XPermittedCrossDomainPoliciesHeader
        {
            get { return (XPermittedCrossDomainPoliciesHeaderElement)this["XPermittedCrossDomainPoliciesHeader"]; }
        }

        [ConfigurationProperty("ReferrerPolicyHeader", IsRequired = false)]
        public ReferrerPolicyHeaderElement ReferrerPolicyHeader
        {
            get { return (ReferrerPolicyHeaderElement)this["ReferrerPolicyHeader"]; }
        }

        [ConfigurationProperty("CrossOriginEmbedderPolicyHeader", IsRequired = false)]
        public CrossOriginEmbedderPolicyHeaderElement CrossOriginEmbedderPolicyHeader
        {
            get { return (CrossOriginEmbedderPolicyHeaderElement)this["CrossOriginEmbedderPolicyHeader"]; }
        }

        [ConfigurationProperty("CrossOriginOpenerPolicyHeader", IsRequired = false)]
        public CrossOriginOpenerPolicyHeaderElement CrossOriginOpenerPolicyHeader
        {
            get { return (CrossOriginOpenerPolicyHeaderElement)this["CrossOriginOpenerPolicyHeader"]; }
        }

        [ConfigurationProperty("CrossOriginResourcePolicyHeader", IsRequired = false)]
        public CrossOriginResourcePolicyHeaderElement CrossOriginResourcePolicyHeader
        {
            get { return (CrossOriginResourcePolicyHeaderElement)this["CrossOriginResourcePolicyHeader"]; }
        }

        public IEnumerable<ResponseHeader> Headers
        {
            get {
                yield return this.StrictTransportSecurity.InnerHeader.Value;
                yield return this.XFrameOptionsHeader.InnerHeader.Value;
                yield return this.XContentTypeOptionsHeader.InnerHeader.Value;
                yield return this.XPermittedCrossDomainPoliciesHeader.InnerHeader.Value;
                yield return this.ReferrerPolicyHeader.InnerHeader.Value;
                yield return this.CrossOriginEmbedderPolicyHeader.InnerHeader.Value;
                yield return this.CrossOriginOpenerPolicyHeader.InnerHeader.Value;
                yield return this.CrossOriginResourcePolicyHeader.InnerHeader.Value;
            }
        }
    }
}
#endif
