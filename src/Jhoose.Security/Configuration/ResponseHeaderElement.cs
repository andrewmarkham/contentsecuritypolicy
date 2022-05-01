
#if NET461_OR_GREATER
using Jhoose.Security.Core.Models;
using System;
using System.Configuration;

namespace Jhoose.Security.Configuration
{
    public abstract class ResponseHeaderElement<T> : ConfigurationElement where T : ResponseHeader
    {
        public abstract Lazy<T> InnerHeader { get; }

        [ConfigurationProperty("enabled", DefaultValue = true)]
        public bool Enabled { 
            get { return base["enabled"] as bool? ?? true; }
            set { base["enabled"] = value;}
         }

        protected virtual E ParseMode<E>(string value, E defaultValue) where E : struct
        {
            E mode;

            if (!Enum.TryParse<E>(value, true, out mode))
            {
                mode = defaultValue;
            }

            return mode;
        }
    }
}

#endif

