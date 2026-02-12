using System;

using System.Linq;

using Jhoose.Security.Features.Core.Cache;
using Jhoose.Security.Features.Core.Services;
using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;

namespace Jhoose.Security.Features.Api.Authorization;

/// <summary>
/// Provides default implementation for authentication key validation service.
/// </summary>
    public class DefaultAuthKeyService(ISettingsRepository settingsRepository,
        ICacheManager cache,
        ILogger<DefaultAuthKeyService> logger,
        ISiteService siteService) : IAuthKeyService
{
    public bool Validate(StringValues apiKeyHeader, string host)
    {
        // get the policy settings
        var policySettings = cache.Get<CspSettings>(Constants.SettingsCacheKey, () => settingsRepository.Load(), new TimeSpan(1, 0, 0));

        var key = apiKeyHeader.FirstOrDefault();

        if (key is null)
        {
            logger.LogTrace("Authentication failed, no key supplied");

            return false;
        }
        else
        {
            var siteId = siteService.ResolveSiteId(host);
            var foundKey = policySettings.AuthenticationKeys?.Any(k =>
                !k.Revoked
                && k.Key.Equals(key)
                && IsKeyAllowedForSite(k, siteId)
            ) ?? false;

            if (!foundKey && logger.IsEnabled(LogLevel.Trace))
                logger.LogTrace("Authentication failed for key {key}", key);

            return foundKey;
        }
    }
    private static bool IsKeyAllowedForSite(AuthenticationKey key, string siteId)
    {
        var keySite = string.IsNullOrWhiteSpace(key.Site) ? "*" : key.Site.Trim();
        if (keySite == "*")
        {
            return true;
        }
        return keySite.Equals(siteId, StringComparison.OrdinalIgnoreCase);
    }
}
