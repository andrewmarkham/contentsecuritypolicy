
#if NET461
using System.Configuration;

namespace Jhoose.Security.Configuration
{
    public class OptionsSection : ConfigurationSection
    {
        [ConfigurationProperty("httpsRedirect", IsRequired = false, DefaultValue = true)]
        public bool HttpsRedirection
        {
            get { return (bool)base["httpsRedirect"]; }
            set { this["httpsRedirect"] = value; }
        }

        [ConfigurationProperty("Exclusions", IsDefaultCollection = true)]
        public ExclusionElementCollection ExclusionPaths
        {
            get 
            { 
                var exclusions = (ExclusionElementCollection)this["Exclusions"] ?? new ExclusionElementCollection();
                    
                if (exclusions.Count == 0)
                {
                    exclusions.AddItem(new ExcludeElement { Path = "/episerver"});
                }

                return exclusions;
            }
            set { this["Exclusions"] = value; }
        }
    }
}
#endif
