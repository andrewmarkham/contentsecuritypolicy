using System;
using System.Collections.Generic;

using System.Linq;

using EPiServer.Core;
using EPiServer.Web;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.CSP.Models;

using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

using Microsoft.Extensions.DependencyInjection;

namespace Jhoose.Security.Features.CSP.Provider;

public class StandardCspProvider : ICspProvider
{
    private readonly string nonceValue;

    private readonly ISecurityRepository<CspPolicy> policyRepository;
    private readonly ISettingsRepository settingsRepository;
    private readonly ISiteDefinitionResolver siteDefinitionResolver;

    public StandardCspProvider([FromKeyedServices("csp")] ISecurityRepository<CspPolicy> policyRepository, ISettingsRepository settingsRepository, ISiteDefinitionResolver siteDefinitionResolver)
    {
        this.policyRepository = policyRepository;
        this.settingsRepository = settingsRepository;
        this.siteDefinitionResolver = siteDefinitionResolver;
        this.nonceValue = Guid.NewGuid().ToString();
    }

    public CspSettings Settings
    {
        get
        {
            return this.settingsRepository.Settings();
        }
    }

    public string GenerateNonce()
    {
        return this.nonceValue;
    }

    public IEnumerable<CspPolicyHeaderBase> PolicyHeaders()
    {
        var rootRef = ContentReference.IsNullOrEmpty(ContentReference.StartPage) ? ContentReference.RootPage : ContentReference.StartPage;
        var host = this.siteDefinitionResolver.GetByContent(rootRef, true).SiteUrl.ToString();

        var policies = this.policyRepository.Load().ToList();
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

            if (actionPolicies.Any())
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

    public void Initialize()
    {
        //this.policyRepository.Bootstrap();
        this.settingsRepository.Bootstrap();
    }

}