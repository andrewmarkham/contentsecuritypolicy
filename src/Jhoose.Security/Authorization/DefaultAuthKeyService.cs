using System;
using System.Linq;

using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Models.CSP;
using Jhoose.Security.Core.Provider;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;

namespace Jhoose.Security.Authorization
{
    /// <summary>
    /// Provides default implementation for authentication key validation service.
    /// </summary>
        public class DefaultAuthKeyService : IAuthKeyService
    {
        private readonly ICspProvider cspProvider;
        private readonly ICacheManager cache;
        private readonly ILogger<DefaultAuthKeyService> logger;

        public DefaultAuthKeyService(ICspProvider cspProvider,
            ICacheManager cache,
            ILogger<DefaultAuthKeyService> logger)
        {
            this.cspProvider = cspProvider;
            this.cache = cache;
            this.logger = logger;
        }

        public bool Validate(StringValues apiKeyHeader)
        {
            // get the policy settings
            var policySettings = cache.Get<CspSettings>(Core.Constants.SettingsCacheKey, () => cspProvider.Settings, new TimeSpan(1, 0, 0));

            var key = apiKeyHeader.FirstOrDefault();

            if (key is null)
            {
                this.logger.LogTrace("Authentication failed, no key supplied");

                return false;
            }
            else
            {
                var foundKey = policySettings.AuthenticationKeys?.Any(k => !k.Revoked && k.Key.Equals(key)) ?? false;

                if (!foundKey)
                    this.logger.LogTrace($"Authentication failed for key {key}");

                return foundKey;
            }
        }
    }
}