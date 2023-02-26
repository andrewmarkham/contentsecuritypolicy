
#if NET461_OR_GREATER
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.SecurityHeaders;
using System;
using System.Configuration;


namespace Jhoose.Security.Configuration
{
    public class ReferrerPolicyHeaderElement : ResponseHeaderElement<ReferrerPolicyHeader>
    {
        public override Lazy<ReferrerPolicyHeader> InnerHeader => new Lazy<ReferrerPolicyHeader>(() => new ReferrerPolicyHeader
        {
            Mode = this.ParseMode<ReferrerPolicyEnum>(this.Mode, ReferrerPolicyEnum.NoReferrer),
            Enabled = this.Enabled
        });

        [ConfigurationProperty("mode", DefaultValue = "NoReferrer")]
        public string Mode
        {
            get { return base["mode"] as string ?? string.Empty; }
            set { base["mode"] = value; }
        }
    }




}
#endif

