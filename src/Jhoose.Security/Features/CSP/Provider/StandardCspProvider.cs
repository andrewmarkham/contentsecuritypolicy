using System;
using System.Collections.Generic;

using System.Linq;

using EPiServer.Core;
using EPiServer.Web;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.CSP.Models;

using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

namespace Jhoose.Security.Features.CSP.Provider;

public class StandardCspProvider(ISecurityRepository<CspPolicy> policyRepository,
    ISettingsRepository settingsRepository,
    ISiteDefinitionResolver siteDefinitionResolver) : ICspProvider
{
    private readonly string nonceValue = Guid.NewGuid().ToString();

    public CspSettings Settings
    {
        get
        {
            return settingsRepository.Load();
        }
    }

    public string GenerateNonce()
    {
        return this.nonceValue;
    }

    public IEnumerable<CspPolicyHeaderBase> PolicyHeaders()
    {
        var rootRef = ContentReference.IsNullOrEmpty(ContentReference.StartPage) ? ContentReference.RootPage : ContentReference.StartPage;
        var host = siteDefinitionResolver.GetByContent(rootRef, true).SiteUrl.ToString();

        var policies = policyRepository.Load().ToList();
        var settings = this.Settings;

        if (!(settings.Mode == "off" || settings.ReportingMode == ReportingMode.None))
        {
            yield return new ReportingEndpointHeader(settings, host, "csp-endpoint");
            yield return new ReportToHeader(settings, host, "csp-endpoint");
        }

        // for global report only
        if (settings.Mode.Equals("report"))
        {
            yield return new CspPolicyReportHeader(settings, host)
            {
                Policies = policies
            };
        }
        else
        {
            var actionPolicies = policies.Where(p => !p.ReportOnly).ToList();

            if (actionPolicies.Count != 0)
            {
                yield return new CspPolicyHeader(settings, host)
                {
                    Policies = actionPolicies
                };
            }

            var reportPolicies = policies.Where(p => p.ReportOnly).ToList();

            if (reportPolicies.Any())
            {
                yield return new CspPolicyReportHeader(settings, host)
                {
                    Policies = reportPolicies
                };
            }
        }
    }
}