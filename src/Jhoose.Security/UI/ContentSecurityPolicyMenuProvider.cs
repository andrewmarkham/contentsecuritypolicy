using System.Collections.Generic;

using EPiServer.Shell;
using EPiServer.Shell.Navigation;

namespace Jhoose.Security.UI;

/// <summary>
/// Provides menu items for the Jhoose Security section in the EPiServer CMS.
/// </summary>
    [MenuProvider]
    public class ContentSecurityPolicyMenuProvider : IMenuProvider
{

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSecurityPolicyMenuProvider"/> class.
    /// </summary>
    public ContentSecurityPolicyMenuProvider()
    {
    }

    public IEnumerable<MenuItem> GetMenuItems()
    {
        var menuItems = new List<MenuItem>
        {
            new UrlMenuItem("Jhoose Security",
            MenuPaths.Global + "/cms/security",
            Paths.ToResource(base.GetType(), "jhoosesecurityadmin"))
            {
                SortIndex = SortIndex.First + 25,
                AuthorizationPolicy = Constants.Authentication.PolicyName
            },

            new UrlMenuItem("Dashboard",
            MenuPaths.Global + "/cms/security/dashboard",
            Paths.ToResource(base.GetType(), "jhoosesecurityadmin#/"))
            {
                SortIndex = SortIndex.First + 26,
                AuthorizationPolicy = Constants.Authentication.PolicyName
            },

            new UrlMenuItem("Issue Search",
            MenuPaths.Global + "/cms/security/cspissues",
            Paths.ToResource(base.GetType(), "jhoosesecurityadmin#/cspissues"))
            {
                SortIndex = SortIndex.First + 27,
                AuthorizationPolicy = Constants.Authentication.PolicyName
            },

            new UrlMenuItem("Content Security",
            MenuPaths.Global + "/cms/security/csp",
            Paths.ToResource(base.GetType(), "jhoosesecurityadmin#/csp"))
            {
                SortIndex = SortIndex.First + 28,
                AuthorizationPolicy = Constants.Authentication.PolicyName
            },

            new UrlMenuItem("Response Headers",
            MenuPaths.Global + "/cms/security/headers",
            Paths.ToResource(base.GetType(), "jhoosesecurityadmin#/headers"))
            {
                SortIndex = SortIndex.First + 29,
                AuthorizationPolicy = Constants.Authentication.PolicyName
            },

            new UrlMenuItem("Permission Policy",
            MenuPaths.Global + "/cms/security/permissions",
            Paths.ToResource(base.GetType(), "jhoosesecurityadmin#/permissions"))
            {
                SortIndex = SortIndex.First + 30,
                AuthorizationPolicy = Constants.Authentication.PolicyName
            },

            new UrlMenuItem("Settings",
            MenuPaths.Global + "/cms/security/settings",
            Paths.ToResource(base.GetType(), "jhoosesecurityadmin#/settings"))
            {
                SortIndex = SortIndex.First + 31,
                AuthorizationPolicy = Constants.Authentication.PolicyName
            }
        };

        return menuItems;
    }
}