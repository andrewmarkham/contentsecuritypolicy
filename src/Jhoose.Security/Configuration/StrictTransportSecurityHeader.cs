
#if NET461_OR_GREATER
using Jhoose.Security.Core.Models;
using System;
using System.Configuration;


namespace Jhoose.Security.Configuration
{
    public class StrictTransportSecurityHeaderElement : ResponseHeaderElement<StrictTransportSecurityHeader>
    {
        public override Lazy<StrictTransportSecurityHeader> InnerHeader => new Lazy<StrictTransportSecurityHeader>(() => new StrictTransportSecurityHeader
        {
            MaxAge = this.MaxAge,
            IncludeSubDomains = this.IncludeSubDomains,
            Enabled = this.Enabled
        });

        [ConfigurationProperty("maxAge", DefaultValue = 31536000)]
        public int MaxAge
        {
            get { return base["maxAge"] as int? ?? 31536000; }
            set { base["maxAge"] = value; }
        }

        [ConfigurationProperty("includeSubDomains", DefaultValue = true)]
        public bool IncludeSubDomains
        {
            get { return base["includeSubDomains"] as bool? ?? true; }
            set { base["includeSubDomains"] = value; }
        }
    }
}
#endif

