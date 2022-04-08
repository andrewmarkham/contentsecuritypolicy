﻿
#if NET461_OR_GREATER
using System.Configuration;
#endif

namespace Jhoose.Security.Configuration
{
#if NET461_OR_GREATER

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

