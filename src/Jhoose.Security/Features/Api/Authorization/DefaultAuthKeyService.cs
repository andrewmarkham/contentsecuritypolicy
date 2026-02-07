using System;
using System.Linq;

using Jhoose.Security.Features.Core.Cache;
using Jhoose.Security.Features.CSP.Provider;
using Jhoose.Security.Features.Settings.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;

namespace Jhoose.Security.Features.Api.Authorization;

/// <summary>
/// Provides default implementation for authentication key validation service.
/// </summary>
    public class DefaultAuthKeyService : IAuthKeyService
{
    private readonly ICspProvider cspProvider;
    private readonly ICacheManager cache;
    private readonly ILogger<DefaultAuthKeyService> logger;
    private readonly IHttpContextAccessor httpContextAccessor;

    public DefaultAuthKeyService(ICspProvider cspProvider,
        ICacheManager cache,
        ILogger<DefaultAuthKeyService> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        this.cspProvider = cspProvider;
        this.cache = cache;
        this.logger = logger;
        this.httpContextAccessor = httpContextAccessor;
    }

    public bool Validate(StringValues apiKeyHeader)
    {
        // get the policy settings
        var policySettings = cache.Get<CspSettings>(Jhoose.Security.Constants.SettingsCacheKey, () => cspProvider.Settings, new TimeSpan(1, 0, 0));

        var key = apiKeyHeader.FirstOrDefault();

        if (key is null)
        {
            this.logger.LogTrace("Authentication failed, no key supplied");

            return false;
        }
        else
        {
            var siteId = ResolveSiteId();
            var foundKey = policySettings.AuthenticationKeys?.Any(k =>
                !k.Revoked
                && k.Key.Equals(key)
                && IsKeyAllowedForSite(k, siteId)
            ) ?? false;

            if (!foundKey)
                this.logger.LogTrace($"Authentication failed for key {key}");

            return foundKey;
        }
    }

    private string ResolveSiteId()
    {
        var host = httpContextAccessor.HttpContext?.Request?.Host.Host;
        return string.IsNullOrWhiteSpace(host) ? "*" : host;
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
