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
    public override IEnumerable<ResponseHeader> Headers(string siteId, string host)
    {
        var policies = permissionsRepository.Load() ?? [];
        var settings = settingsRepository.Load();
        var mode = settings.GetPermissionModeForSite(siteId);

        if (!(mode == "off" || settings.ReportingMode == ReportingMode.None))
        {
            yield return new ReportingEndpointHeader(settings, host, "permissions-endpoint");
        }

        var mergedPolicies = this.MergePolicies(siteId, policies.ToList());
            
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
