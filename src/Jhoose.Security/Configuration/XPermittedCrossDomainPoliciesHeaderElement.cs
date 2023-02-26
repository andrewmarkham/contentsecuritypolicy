
#if NET461_OR_GREATER
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.SecurityHeaders;
using System;
using System.Configuration;


namespace Jhoose.Security.Configuration
{
    public class XPermittedCrossDomainPoliciesHeaderElement : ResponseHeaderElement<XPermittedCrossDomainPoliciesHeader>
    {
        public override Lazy<XPermittedCrossDomainPoliciesHeader> InnerHeader => new Lazy<XPermittedCrossDomainPoliciesHeader>(() => new XPermittedCrossDomainPoliciesHeader
        {
            Mode = this.ParseMode<XPermittedCrossDomainPoliciesEnum>(this.Mode, XPermittedCrossDomainPoliciesEnum.None),
            Enabled = this.Enabled
        });

        [ConfigurationProperty("mode", DefaultValue = "None")]
        public string Mode
        {
            get { return base["mode"] as string ?? string.Empty; }
            set { base["mode"] = value; }
        }
    }




}
#endif

