using System.Collections.Generic;
using System.Linq;

using EPiServer.Core;
using EPiServer.Web;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.Permissions.Models;
using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

namespace Jhoose.Security.Features.Permissions.Providers;

public class StandardPermissionsProvider(ISecurityRepository<PermissionPolicy> permissionsRepository, 
    ISettingsRepository settingsRepository, 
    ISiteDefinitionResolver siteDefinitionResolver) : IPermissionsProvider
{
    public IEnumerable<ResponseHeader> PermissionPolicies()
    {
        var rootRef = ContentReference.IsNullOrEmpty(ContentReference.StartPage) ? ContentReference.RootPage : ContentReference.StartPage;
        var host = siteDefinitionResolver.GetByContent(rootRef, true).SiteUrl.ToString();

        var policies = permissionsRepository.Load();
        var settings = settingsRepository.Load();

        if (!(settings.PermissionMode == "off" || settings.ReportingMode == ReportingMode.None))
        {
            yield return new ReportingEndpointHeader(settings, host, "permissions-endpoint");
        }

        // for global report only
        if (settings.PermissionMode.Equals("report"))
        {
            yield return new PermissionsPolicyReportHeader(settings, host)
            {
                Policies = [..policies]
            };
        }
        else
        {
            var actionPolicies = policies.Where(p => p.Mode != "report").ToList();

            if (actionPolicies.Count > 0)
            {
                yield return new PermissionsPolicyHeader(settings, host)
                {
                    Policies = actionPolicies
                };
            }

            var reportPolicies = policies.Where(p => p.Mode == "report").ToList();

            if (reportPolicies.Count > 0)
            {
                yield return new PermissionsPolicyReportHeader(settings, host)
                {
                    Policies = reportPolicies
                };
            }
        }
    }
}