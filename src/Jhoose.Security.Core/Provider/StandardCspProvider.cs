using System;
using System.Collections.Generic;

using System.Linq;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.CSP;
using Jhoose.Security.Core.Repository;

namespace Jhoose.Security.Core.Provider
{
    public class StandardCspProvider : ICspProvider
    {
        private readonly string nonceValue;

        private readonly ICspPolicyRepository policyRepository;

        public StandardCspProvider(ICspPolicyRepository policyRepository)
        {
            this.policyRepository = policyRepository;
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
            var policies = this.policyRepository.List();
            var settings = this.Settings;

            if (!(settings.Mode == "off" || settings.ReportingMode == ReportingMode.None))
            {
                yield return new ReportingEndpointHeader(settings);

            }

            // for global report only
            if (settings.Mode.Equals("report"))
            {
                yield return new CspPolicyReportHeader(settings)
                {
                    Policies = policies
                };
            }
            else
            {
                var actionPolicies = policies.Where(p => !p.ReportOnly).ToList();

                if (actionPolicies.Any())
                {
                    yield return new CspPolicyHeader(settings)
                    {
                        Policies = actionPolicies
                    };
                }

                var reportPolicies = policies.Where(p => p.ReportOnly).ToList();

                if (reportPolicies.Any())
                {
                    yield return new CspPolicyReportHeader(settings)
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