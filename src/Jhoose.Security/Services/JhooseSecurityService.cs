
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core;
using Jhoose.Security.Core.Models.CSP;


#if NET5_0_OR_GREATER
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
#else
using System.Web;
using EPiServer.Logging;
#endif

namespace Jhoose.Security.Services
{
    public class JhooseSecurityService : IJhooseSecurityService
    {
        private readonly ICspProvider cspProvider;
        private readonly ICacheManager cache;

#if NET5_0_OR_GREATER
        private readonly ILogger<JhooseSecurityService> logger;
#else
        private static readonly ILogger logger = LogManager.GetLogger();
#endif

#if NET5_0_OR_GREATER
        public JhooseSecurityService(ICspProvider cspProvider,
            ICacheManager cache,
            ILogger<JhooseSecurityService> logger)
        {
            this.cspProvider = cspProvider;
            this.cache = cache;
            this.logger = logger;
        }
#else
        public JhooseSecurityService(ICspProvider cspProvider,
            ICacheManager cache)
        {
            this.cspProvider = cspProvider;
            this.cache = cache;
        }
#endif
        public void AddHeaders(HttpResponse response, IEnumerable<ResponseHeader> headers)
        {
            try
            {
                var enabledHeaders = headers.Where(h => h.Enabled);

                foreach (var header in enabledHeaders)
                {

                    if (response.Headers.ContainsKey(header.Name))
                    {
#if NET5_0_OR_GREATER
                        logger.LogWarning($"Header : {header.Name} already exists in the reponse, the Jhoose CSP module will not override this");
#else
                        logger.Warning($"Header : {header.Name} already exists in the reponse, the Jhoose CSP module will not override this");
#endif
                    }
                    else
                    {
                        response.Headers.Add(header.Name, header.Value);
                    }
                }

                //response.Headers.Remove("X-Powered-By");
                response.Headers.Remove("X-AspNet-Version");
                response.Headers.Remove("X-AspNetMvc-Version");

            }
            catch (Exception ex)
            {
                // Error is logged, but will not stop execution.
#if NET5_0_OR_GREATER
                logger.LogError(ex, "Failed to add header");
#else
                logger.Error("Failed to add header", ex);
#endif
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
                    var headerValues = cache.Get<IEnumerable<CspPolicyHeaderBase>>(Constants.PolicyCacheKey, () => cspProvider.PolicyHeaders(), new TimeSpan(1, 0, 0));

                    foreach (var header in headerValues)
                    {
                        header.NonceValue = this.cspProvider.GenerateNonce();

                        if (response.Headers.ContainsKey(header.Name))
                        {

#if NET5_0_OR_GREATER
                            logger.LogWarning($"Header : {header.Name} already exists in the reponse, the Jhoose CSP module will not override this");

#else
                            logger.Warning($"Header : {header.Name} already exists in the reponse, the Jhoose CSP module will not override this");

#endif
                        }
                        else
                        {
                            response.Headers.Add(header.Name, header.Value);
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                // Error is logged, but will not stop execution.
#if NET5_0_OR_GREATER
                logger.LogError(ex, "Failed to add header");
#else
                logger.Error("Failed to add header", ex);
#endif
            }
        }
    }

#if NET461_OR_GREATER
    public static class NameValueCollectionEx
    {
        public static bool ContainsKey(this System.Collections.Specialized.NameValueCollection collection, string keyName)
        {
            return collection[keyName] != null;
        }
    }
#endif
}
