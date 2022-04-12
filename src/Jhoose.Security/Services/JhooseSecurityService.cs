
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core;


#if NET5_0_OR_GREATER
    using Microsoft.AspNetCore.Http;
#else
    using System.Web;
#endif

namespace Jhoose.Security.Services
{
    public class JhooseSecurityService : IJhooseSecurityService
    {
        private readonly ICspProvider cspProvider;
        private readonly ICacheManager cache;

        public JhooseSecurityService(ICspProvider cspProvider, ICacheManager cache)
        {
            this.cspProvider = cspProvider;
            this.cache = cache;
        }

        public void AddHeaders(HttpResponse response, IEnumerable<ResponseHeader> headers)
        {
            var enabledHeaders = headers.Where(h => h.Enabled);

            foreach (var header in enabledHeaders)
            {
                response.Headers.Add(header.Name, header.Value);
            }

            response.Headers.Remove("X-Powered-By");
            response.Headers.Remove("X-AspNet-Version");
            response.Headers.Remove("X-AspNetMvc-Version");
        }

        public void AddContentSecurityPolicy(HttpResponse response)
        {
            // get the policy settings
            var policySettings = cache.Get<CspSettings>(Constants.SettingsCacheKey, () => cspProvider.Settings, new TimeSpan(1, 0, 0));


            if (policySettings.IsEnabled)
            {
                // get the policy
                var headerValues = cache.Get<IEnumerable<CspPolicyHeader>>(Constants.PolicyCacheKey, () => cspProvider.PolicyHeaders(), new TimeSpan(1, 0, 0));

                foreach (var header in headerValues)
                {
                    response.Headers.Add(header.Header, header.BuildValue(policySettings.ReportingUrl, cspProvider.GenerateNonce()));
                }

            }
        }
    }
}
