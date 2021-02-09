using System;
using System.Collections.Generic;
using EPiServer;
using EPiServer.Shell;
using EPiServer.Shell.Navigation;

namespace Jhoose.Security.Admin
{
    [MenuProvider]
    public class ContentSecurityPolicyMenuProvider : IMenuProvider
    {
        public IEnumerable<MenuItem> GetMenuItems()
        {
            var menuItems = new List<MenuItem>();

            menuItems.Add(new UrlMenuItem("Content Security",
                MenuPaths.Global + "/cms" + "/cmsMenuItem",
                UriSupport.ResolveUrlFromUIAsRelativeOrAbsolute("ContentSecurityPolicy"))
            {
                SortIndex = SortIndex.First + 25,
                IsAvailable = (request) => true
            });

            return menuItems;
        }
    }
}
