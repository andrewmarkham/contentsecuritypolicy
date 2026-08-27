using System.Collections.Generic;

using System.Linq;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.Core.Providers;
using Jhoose.Security.Features.CSP.Models;

using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

namespace Jhoose.Security.Features.CSP.Provider;

public class StandardCspProvider(ISecurityRepository<CspPolicy> policyRepository,
    ISettingsRepository settingsRepository) : HeaderProviderBase<CspPolicyHeaderBase>
{

    public override IEnumerable<CspPolicyHeaderBase> Headers(string siteId, string host)
    {
        var policies = policyRepository.Load().ToList();

        var settings = settingsRepository.Load();
        var mode = settings.GetModeForSite(siteId);

        if (!(mode == "off" || settings.ReportingMode == ReportingMode.None))
        {
            yield return new ReportingEndpointHeader(settings, host, "csp-endpoint");
            yield return new ReportToHeader(settings, host, "csp-endpoint");
        }

        var mergedPolicies = this.MergePolicies(siteId, policies.ToList());
            
        // for global report only
        if (mode.Equals("report"))
        {
            yield return new CspPolicyReportHeader(settings, host)
            {
                Policies = mergedPolicies
            };
        }
        else
        {
            var actionPolicies = mergedPolicies.Where(p => !p.ReportOnly).ToList();

            if (actionPolicies.Count != 0)
            {
                yield return new CspPolicyHeader(settings, host)
                {
                    Policies = actionPolicies
                };
            }

            var reportPolicies = mergedPolicies.Where(p => p.ReportOnly).ToList();

            if (reportPolicies.Count != 0)
            {
                yield return new CspPolicyReportHeader(settings, host)
                {
                    Policies = reportPolicies
                };
            }
        }
    }
}
