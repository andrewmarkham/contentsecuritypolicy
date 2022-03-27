
#if NET461
using Jhoose.Security.Core.Models;
using System;
using System.Configuration;


namespace Jhoose.Security.Configuration
{
    public class CrossOriginResourcePolicyHeaderElement : ResponseHeaderElement<CrossOriginResourcePolicyHeader>
    {
        public override Lazy<CrossOriginResourcePolicyHeader> InnerHeader => new Lazy<CrossOriginResourcePolicyHeader>(() => new CrossOriginResourcePolicyHeader
        {
            Mode = this.ParseMode<CrossOriginResourcePolicyEnum>(this.Mode, CrossOriginResourcePolicyEnum.SameOrigin),
            Enabled = this.Enabled
        });

        [ConfigurationProperty("mode", DefaultValue = "SameOrigin")]
        public string Mode
        {
            get { return base["mode"] as string ?? string.Empty; }
            set { base["mode"] = value; }
        }
    }
}
#endif

