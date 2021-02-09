using System;
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

        public string GenerateNonce() {
            return this.nonceValue;
        }

        public string HeaderValue()
        {
            var sb = new StringBuilder();
            var policies = this.policyRepository.List();

            foreach (var p in policies)
            {
                var v = this.PolicyValue(p);
                if (string.IsNullOrEmpty(v))
                { 
                    continue;
                }

                sb.Append(v);
            }

            return sb.ToString();
        }

        public void Initialize()
        {
            this.policyRepository.Bootstrap();
        }

        public string PolicyValue(CspPolicy policy) 
        {
            var sb = new StringBuilder();
            if (policy.Options.None | policy.Options.Wildcard | policy.Options.Self | policy.Options.Data | !string.IsNullOrEmpty(policy.Value))
            {
                sb.AppendFormat($"{policy.PolicyName} ");
                if (policy.Options.None)
                {
                    sb.Append("'none'; ");
                    return sb.ToString();
                }

                if(policy.Options.Wildcard) sb.Append("* ");
                if(policy.Options.Self) sb.Append("'self' ");
                if(policy.Options.Data) sb.Append("data: ");

                if (policy.PolicyName.Equals("script-src", StringComparison.InvariantCultureIgnoreCase) || policy.PolicyName.Equals("style-src", StringComparison.InvariantCultureIgnoreCase)) {
                    sb.Append("'nonce-{0}' ");
                }
                
                sb.AppendFormat($"{policy.Value}; ");
            }

            return sb.ToString();
        }
    }
}