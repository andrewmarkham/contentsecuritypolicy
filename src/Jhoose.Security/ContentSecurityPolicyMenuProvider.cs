using System.Collections.Generic;
using EPiServer.Shell;
using EPiServer.Shell.Navigation;
using Jhoose.Security.Authorization;

namespace Jhoose.Security
{
    [MenuProvider]
    public class ContentSecurityPolicyMenuProvider : IMenuProvider
    {

        public ContentSecurityPolicyMenuProvider()
        {
        }

        public IEnumerable<MenuItem> GetMenuItems()
        {
            var menuItems = new List<MenuItem>
            {
                new UrlMenuItem("Security",
                MenuPaths.Global + "/cms/security",
                Paths.ToResource(base.GetType(), "jhoosesecurityadmin"))
                {
                    SortIndex = SortIndex.First + 25,
                    AuthorizationPolicy = Constants.PolicyName
                },

                new UrlMenuItem("Content Security",
                MenuPaths.Global + "/cms/security/csp",
                Paths.ToResource(base.GetType(), "jhoosesecurityadmin#/csp"))
                {
                    SortIndex = SortIndex.First + 25,
                    AuthorizationPolicy = Constants.PolicyName
                },

                new UrlMenuItem("Response Headers",
                MenuPaths.Global + "/cms/security/headers",
                Paths.ToResource(base.GetType(), "jhoosesecurityadmin#/headers"))
                {
                    SortIndex = SortIndex.First + 26,
                    AuthorizationPolicy = Constants.PolicyName
                }
            };

            return menuItems;
        }
    }
}
