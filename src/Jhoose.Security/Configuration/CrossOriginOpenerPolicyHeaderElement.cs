
#if NET461
using Jhoose.Security.Core.Models;
using System;
using System.Configuration;


namespace Jhoose.Security.Configuration
{
    public class CrossOriginOpenerPolicyHeaderElement : ResponseHeaderElement<CrossOriginOpenerPolicyHeader>
    {
        public override Lazy<CrossOriginOpenerPolicyHeader> InnerHeader => new Lazy<CrossOriginOpenerPolicyHeader>(() => new CrossOriginOpenerPolicyHeader
        {
            Mode = this.ParseMode<CrossOriginOpenerPolicyEnum>(this.Mode, CrossOriginOpenerPolicyEnum.UnSafeNone),
            Enabled = this.Enabled
        });

        [ConfigurationProperty("mode", DefaultValue = "UnSafeNone")]
        public string Mode
        {
            get { return base["mode"] as string ?? string.Empty; }
            set { base["mode"] = value; }
        }
    }
}
#endif

