
#if NET461_OR_GREATER
using System.Configuration;
#endif

namespace Jhoose.Security.Configuration
{
#if NET461_OR_GREATER
    public class JhooseSecurityOptionsConfigurationSectionGroup : ConfigurationSectionGroup
    {

        [ConfigurationProperty("Options")]
        public OptionsSection Options
        {
            get { return (OptionsSection)base.Sections["Options"]; }

        }

        [ConfigurationProperty("Headers")]
        public HeadersSection Headers
        {
            get { return (HeadersSection)base.Sections["Headers"]; }

        }
    }
#endif
}

