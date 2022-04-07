
#if NET461
using Jhoose.Security.Core.Models;
using System;
using System.Configuration;


namespace Jhoose.Security.Configuration
{
    public class CrossOriginEmbedderPolicyHeaderElement : ResponseHeaderElement<CrossOriginEmbedderPolicyHeader>
    {
        public override Lazy<CrossOriginEmbedderPolicyHeader> InnerHeader => new Lazy<CrossOriginEmbedderPolicyHeader>(() => new CrossOriginEmbedderPolicyHeader
        {
            Mode = this.ParseMode<CrossOriginEmbedderPolicyEnum>(this.Mode, CrossOriginEmbedderPolicyEnum.UnSafeNone),
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

