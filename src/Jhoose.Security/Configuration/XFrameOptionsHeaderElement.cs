
#if NET461_OR_GREATER
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.SecurityHeaders;
using System;
using System.Configuration;


namespace Jhoose.Security.Configuration
{
    public class XFrameOptionsHeaderElement : ResponseHeaderElement<XFrameOptionsHeader>
    {

        public override Lazy<XFrameOptionsHeader> InnerHeader => new Lazy<XFrameOptionsHeader>(() => new XFrameOptionsHeader
        {
            Domain = this.Domain,
            Mode = this.ParseMode<XFrameOptionsEnum>(this.Mode, XFrameOptionsEnum.Deny),
            Enabled = this.Enabled
        });

        [ConfigurationProperty("mode", DefaultValue = "Deny")]
        public string Mode
        {
            get { return base["mode"] as string ?? string.Empty; }
            set { base["mode"] = value; }
        }

        [ConfigurationProperty("domain", DefaultValue = "")]
        public string Domain
        {
            get { return base["domain"] as string ?? string.Empty; }
            set { base["domain"] = value; }
        }
    }




}
#endif

