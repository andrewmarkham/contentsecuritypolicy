using System.Collections.Generic;
using System.Linq;

using EPiServer.Core;
using EPiServer.Web;

using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.Permissions.Repository;
using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;
using Jhoose.Security.Models;

namespace Jhoose.Security.Features.Permissions.Providers;

public class StandardPermissionsProvider : IPermissionsProvider
{
    private readonly IPermissionsRepository permissionsRepository;
    private readonly ISiteDefinitionResolver siteDefinitionResolver;
    private readonly ISettingsRepository settingsRepository;

    public StandardPermissionsProvider(IPermissionsRepository permissionsRepository, ISettingsRepository settingsRepository, ISiteDefinitionResolver siteDefinitionResolver)
    {
        this.permissionsRepository = permissionsRepository;
        this.settingsRepository = settingsRepository;
        this.siteDefinitionResolver = siteDefinitionResolver;
    }

    public void Initialize()
    {
        this.permissionsRepository.Bootstrap();
    }

    public IEnumerable<ResponseHeader> PermissionPolicies()
    {
        var rootRef = ContentReference.IsNullOrEmpty(ContentReference.StartPage) ? ContentReference.RootPage : ContentReference.StartPage;
        var host = this.siteDefinitionResolver.GetByContent(rootRef, true).SiteUrl.ToString();

        var policies = this.permissionsRepository.List();
        var settings = this.settingsRepository.Settings();

        if (!(settings.PermissionMode == "off" || settings.ReportingMode == ReportingMode.None))
        {
            yield return new ReportingEndpointHeader(settings, host, "permissions-endpoint");
            //yield return new ReportToHeader(settings, host, "permissions-endpoint");

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

            if (actionPolicies.Any())
            {
                yield return new PermissionsPolicyHeader(settings, host)
                {
                    Policies = actionPolicies
                };
            }

            var reportPolicies = policies.Where(p => p.Mode == "report").ToList();

            if (reportPolicies.Any())
            {
                yield return new PermissionsPolicyReportHeader(settings, host)
                {
                    Policies = reportPolicies
                };
            }
        }
    }
}