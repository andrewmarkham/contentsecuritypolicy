using System.Collections.Generic;
using System.Linq;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.Core.Providers;
using Jhoose.Security.Features.CSP.Models;

using Jhoose.Security.Features.Permissions.Models;
using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

namespace Jhoose.Security.Features.Permissions.Providers;

public class StandardPermissionsProvider(ISecurityRepository<PermissionPolicy> permissionsRepository, 
    ISettingsRepository settingsRepository) : HeaderProviderBase<ResponseHeader>
{
    public override IEnumerable<ResponseHeader> Headers(string siteId, string host) => Headers(siteId, host, string.Empty);

    public override IEnumerable<ResponseHeader> Headers(string siteId, string host, string contentLink)
    {
        var policies = permissionsRepository.Load() ?? [];
        var settings = settingsRepository.Load();
        var mode = settings.GetPermissionModeForSite(siteId);

        if (!(mode == "off" || settings.ReportingMode == ReportingMode.None))
        {
            yield return new ReportingEndpointHeader(settings, host, "permissions-endpoint");
        }

        // "default" means different things at different scopes. At site/global scope it means "no
        // override here", so those entries are excluded up front and simply let a lower-priority
        // tier win the merge, same as before. At page scope it means "explicitly suppress this
        // permission on this page", so a page-scoped "default" entry must still win its merge slot
        // (excluding it here would let the site/global entry underneath it leak through instead) -
        // it's only dropped from the final output afterwards, which discards the whole permission
        // for this page rather than falling back to whatever site/global has set.
        var candidatePolicies = policies
            .Where(p => p.Mode != "default" || (!string.IsNullOrEmpty(p.ContentLink) && p.ContentLink == contentLink))
            .ToList();

        var mergedPolicies = this.MergePolicies(siteId, contentLink, candidatePolicies)
            .Where(p => p.Mode != "default")
            .ToList();

        // for global report only
        if (mode.Equals("report"))
        {
            yield return new PermissionsPolicyReportHeader(settings, host)
            {
                Policies = mergedPolicies
            };
        }
        else
        {
            var actionPolicies = mergedPolicies.Where(p => p.Mode != "report").ToList();

            if (actionPolicies.Count > 0)
            {
                yield return new PermissionsPolicyHeader(settings, host)
                {
                    Policies = actionPolicies
                };
            }

            var reportPolicies = mergedPolicies.Where(p => p.Mode == "report").ToList();

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
