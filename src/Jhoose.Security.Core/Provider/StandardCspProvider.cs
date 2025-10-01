using System;
using System.Collections.Generic;

using System.Linq;

using EPiServer.Core;
using EPiServer.Web;

using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.CSP;
using Jhoose.Security.Core.Repository;

namespace Jhoose.Security.Core.Provider
{
    public class StandardCspProvider : ICspProvider
    {
        private readonly string nonceValue;

        private readonly ICspPolicyRepository policyRepository;
        private readonly ISiteDefinitionResolver siteDefinitionResolver;

        public StandardCspProvider(ICspPolicyRepository policyRepository, ISiteDefinitionResolver siteDefinitionResolver)
        {
            this.policyRepository = policyRepository;
            this.siteDefinitionResolver = siteDefinitionResolver;
            this.nonceValue = Guid.NewGuid().ToString();
        }

        public CspSettings Settings
        {
            get
            {
                return this.policyRepository.Settings();
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

            var policies = this.policyRepository.List();
            var settings = this.Settings;

            if (!(settings.Mode == "off" || settings.ReportingMode == ReportingMode.None))
            {
                yield return new ReportingEndpointHeader(settings, host);
                yield return new ReportToHeader(settings, host);

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
            this.policyRepository.Bootstrap();
        }

    }
}