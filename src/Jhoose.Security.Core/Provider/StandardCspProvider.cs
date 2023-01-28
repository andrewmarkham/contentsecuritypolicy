using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Jhoose.Security.Core.Models;
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

            if (!string.IsNullOrEmpty(this.Settings.ReportingUrl))
            {
                yield return new ReportingEndpointHeader(this.Settings.ReportingUrl);

            }

            // for global report only
            if (this.Settings.Mode.Equals("report"))
            {
                yield return new CspPolicyReportHeader(this.Settings.ReportingUrl)
                {
                    Policies = policies
                };
            }
            else
            {
                var actionPolicies = policies.Where(p => !p.ReportOnly).ToList();

                if (actionPolicies.Any())
                {
                    yield return new CspPolicyHeader(this.Settings.ReportingUrl)
                    {
                        Policies = actionPolicies
                    };
                }

                var reportPolicies = policies.Where(p => p.ReportOnly).ToList();

                if (reportPolicies.Any())
                {
                    yield return new CspPolicyReportHeader(this.Settings.ReportingUrl)
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