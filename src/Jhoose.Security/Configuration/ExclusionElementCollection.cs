#if NET461_OR_GREATER
using System.Configuration;

namespace Jhoose.Security.Configuration
{

    [ConfigurationCollection(typeof(ExcludeElement))]
    public class ExclusionElementCollection : ConfigurationElementCollection
    {
        public ExcludeElement this[int index]
        {
            get { return (ExcludeElement)BaseGet(index); }
            set
            {
                if (BaseGet(index) != null)
                    BaseRemoveAt(index);
                BaseAdd(index, value);
            }
        }
        protected override ConfigurationElement CreateNewElement()
        {
            return new ExcludeElement();
        }
        protected override object GetElementKey(ConfigurationElement element)
        {
            return ((ExcludeElement)element).Path;
        }

        public void AddItem(ExcludeElement excludeElement)
        {
            this.LockItem = false;
            this.BaseAdd(excludeElement);
        }
    }
}

#endif

