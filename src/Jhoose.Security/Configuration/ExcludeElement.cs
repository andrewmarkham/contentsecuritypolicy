
#if NET461
using System.Configuration;
#endif

namespace Jhoose.Security.Configuration
{
#if NET461

    public class ExcludeElement : ConfigurationElement
    {
        [ConfigurationProperty("path", IsRequired = true)]
        public string Path
        {
            get { return (string)this["path"]; }
            set { this["path"] = value; }
        }
    }
#endif
}

