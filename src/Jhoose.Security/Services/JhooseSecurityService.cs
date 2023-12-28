
using System;
using System.Collections.Generic;
using System.Linq;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core;
using Jhoose.Security.Core.Models.CSP;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;


namespace Jhoose.Security.Services
{
    public class JhooseSecurityService : IJhooseSecurityService
    {
        private readonly ICspProvider cspProvider;
        private readonly IResponseHeadersProvider responseHeaderProvider;
        private readonly ICacheManager cache;

        private readonly ILogger<JhooseSecurityService> logger;

        public JhooseSecurityService(ICspProvider cspProvider,
                                     IResponseHeadersProvider responseHeaderProvider,
            ICacheManager cache,
            ILogger<JhooseSecurityService> logger)
        {
            this.cspProvider = cspProvider;
            this.responseHeaderProvider = responseHeaderProvider;
            this.cache = cache;
            this.logger = logger;

        }

        public void AddHeaders(HttpResponse response)
        {
            try
            {
                var headerValues = cache.Get<List<ResponseHeader>>(Constants.ResponseHeadersCacheKey, () => responseHeaderProvider.ResponseHeaders().ToList(), new TimeSpan(1, 0, 0));

                var enabledHeaders = headerValues.Where(h => h.Enabled);

                foreach (var header in enabledHeaders)
                {

                    if (response.Headers.ContainsKey(header.Name))
                    {
                        logger.LogWarning($"Header : {header.Name} already exists in the reponse, the Jhoose CSP module will not override this");
                    }
                    else
                    {
                        response.Headers.Append(header.Name, header.Value);
                    }
                }

                response.Headers.Remove("X-AspNet-Version");
                response.Headers.Remove("X-AspNetMvc-Version");

            }
            catch (Exception ex)
            {
                // Error is logged, but will not stop execution.
                logger.LogError(ex, "Failed to add header");
            }
        }

        public void AddContentSecurityPolicy(HttpResponse response)
        {
            try
            {
                // get the policy settings
                var policySettings = cache.Get<CspSettings>(Constants.SettingsCacheKey, () => cspProvider.Settings, new TimeSpan(1, 0, 0));

                if (policySettings.IsEnabled)
                {
                    // get the policy
                    var headerValues = cache.Get<List<CspPolicyHeaderBase>>(Constants.PolicyCacheKey, () => cspProvider.PolicyHeaders().ToList(), new TimeSpan(1, 0, 0));

                    foreach (var header in headerValues)
                    {
                        header.NonceValue = this.cspProvider.GenerateNonce();

                        if (response.Headers.ContainsKey(header.Name))
                        {
                            logger.LogWarning($"Header : {header.Name} already exists in the reponse, the Jhoose CSP module will not override this");
                        }
                        else
                        {
                            response.Headers.Append(header.Name, header.Value);
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                // Error is logged, but will not stop execution.
                logger.LogError(ex, "Failed to add header");
            }
        }
    }
}
