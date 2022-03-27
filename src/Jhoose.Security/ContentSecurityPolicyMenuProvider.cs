using System;
using System.Collections.Generic;
using EPiServer;
using EPiServer.Security;
using EPiServer.Shell;
using EPiServer.Shell.Navigation;

namespace Jhoose.Security
{
    [MenuProvider]
    public class ContentSecurityPolicyMenuProvider : IMenuProvider
    {
        private readonly IPrincipalAccessor principalAccessor;

        public ContentSecurityPolicyMenuProvider(IPrincipalAccessor principalAccessor)
        {
            this.principalAccessor = principalAccessor;
        }

        public IEnumerable<MenuItem> GetMenuItems()
        {
            var menuItems = new List<MenuItem>();

            menuItems.Add(new UrlMenuItem("Security",
                MenuPaths.Global + "/cms/security",
                Paths.ToResource(base.GetType(),"jhoosesecurityadmin"))
            {
                SortIndex = SortIndex.First + 25,
#if NET461
                IsAvailable = (request) => true, //this.principalAccessor.Principal.IsInRole("CmsAdmin"),
#elif NET5_0_OR_GREATER
                IsAvailable = (request) => true,
                AuthorizationPolicy = "episerver:cmsadmin"
#endif
            });

            menuItems.Add(new UrlMenuItem("Content Security",
                MenuPaths.Global + "/cms/security/csp",
                Paths.ToResource(base.GetType(),"jhoosesecurityadmin#/csp"))
            {
                SortIndex = SortIndex.First + 25,
#if NET461
                IsAvailable = (request) => true, //this.principalAccessor.Principal.IsInRole("CmsAdmin"),
#elif NET5_0_OR_GREATER
                IsAvailable = (request) => true,
                AuthorizationPolicy = "episerver:cmsadmin"
#endif
            });

            return menuItems;
        }
    }
}
