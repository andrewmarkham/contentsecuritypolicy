
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

using Jhoose.Security.Features.Api.Authorization;
using Jhoose.Security.Features.Api.Models;
using Jhoose.Security.Features.Core.Cache;
using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.CSP.Provider;
using Jhoose.Security.Features.Permissions.Providers;
using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.ResponseHeaders.Providers;
using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Api;

/// <summary>
/// API controller providing access to security headers, including Content Security Policy (CSP) and Permissions Policy.
/// </summary>
/// <param name="cspProvider">The provider for Content Security Policy headers.</param>
/// <param name="settingsRepository">The repository for accessing security settings.</param>
/// <param name="responseHeaderProvider">The provider for response headers.</param>
/// <param name="permissionsProvider">The provider for permissions policy headers.</param>
/// <param name="cache">The cache manager for caching headers and settings.</param>
/// <param name="logger">The logger for logging errors and information.</param>
[Route("api/[controller]")]
[ApiController]
public class JhooseController(ICspProvider cspProvider,
    ISettingsRepository settingsRepository,
    IResponseHeadersProvider responseHeaderProvider,
    IPermissionsProvider permissionsProvider,
    ICacheManager cache,
    ILogger<JhooseController> logger) : ControllerBase
{
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };


    /// <summary>
    /// Gets the security headers, including Content Security Policy (CSP) and Permissions Policy.
    /// </summary>
    /// <param name="headerRequest"></param>
    /// <returns></returns>
    [ApiKeyAuthorization]
    [HttpPost]
    [Route("headers")]
    public ActionResult Headers(
        [FromBody] HeaderRequest headerRequest)
    {
        try
        {
            List<KeyValuePair<string, string>> headers = [..this.GetHeaders(), ..this.GetContentSecurityPolicy(headerRequest.Nonce), ..this.GetContentPermissionsPolicy()];

            return new JsonResult(headers ?? [], jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error getting headers/csp");
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private IEnumerable<KeyValuePair<string, string>> GetHeaders()
    {
        var headerValues = cache.Get<List<ResponseHeader>>(Constants.ResponseHeadersCacheKey,
            () => [.. responseHeaderProvider.ResponseHeaders().Where(h => h.Enabled)], new TimeSpan(1, 0, 0));


        foreach (var header in headerValues)
        {
            yield return new KeyValuePair<string, string>(header.Name, header.Value);
        }
    }

    private IEnumerable<KeyValuePair<string, string>> GetContentSecurityPolicy(string nonce)
    {
        // get the policy settings
        var policySettings = cache.Get<CspSettings>(Constants.SettingsCacheKey, () => settingsRepository.Load(),
            new TimeSpan(1, 0, 0));

        var siteId = ResolveSiteId();
        if (policySettings.IsEnabledForSite(siteId))
        {
            // get the policy
            var policyCache = cache.Get<Dictionary<string, List<CspPolicyHeaderBase>>>(Constants.PolicyCacheKey)
                ?? new Dictionary<string, List<CspPolicyHeaderBase>>(StringComparer.OrdinalIgnoreCase);
            if (!policyCache.TryGetValue(siteId, out var cachedHeaderValues))
            {
                cachedHeaderValues = [.. cspProvider.PolicyHeaders()];
                policyCache[siteId] = cachedHeaderValues;
                cache.Insert(Constants.PolicyCacheKey, policyCache, new TimeSpan(1, 0, 0));
            }

            foreach (var cachedHeader in cachedHeaderValues)
            {
                var header = cachedHeader.Clone();
                header.NonceValue = nonce;
                yield return new KeyValuePair<string, string>(header.Name, header.Value);
            }
        }
    }

    private IEnumerable<KeyValuePair<string, string>> GetContentPermissionsPolicy()
    {
        // get the policy settings
        var policySettings = cache.Get<CspSettings>(Constants.SettingsCacheKey, () => settingsRepository.Load(),
            new TimeSpan(1, 0, 0));

        var siteId = ResolveSiteId();
        if (policySettings.IsPermissionsEnabledForSite(siteId))
        {
            // get the policy
            var permissionsCache = cache.Get<Dictionary<string, List<ResponseHeader>>>(Constants.PermissionPolicyCacheKey)
                ?? new Dictionary<string, List<ResponseHeader>>(StringComparer.OrdinalIgnoreCase);
            if (!permissionsCache.TryGetValue(siteId, out var headerValues))
            {
                headerValues = [.. permissionsProvider.PermissionPolicies()];
                permissionsCache[siteId] = headerValues;
                cache.Insert(Constants.PermissionPolicyCacheKey, permissionsCache, new TimeSpan(1, 0, 0));
            }

            foreach (var header in headerValues)
            {
                yield return new KeyValuePair<string, string>(header.Name, header.Value);
            }
        }
    }

    private string ResolveSiteId()
    {
        var host = HttpContext?.Request?.Host.Host;
        return string.IsNullOrWhiteSpace(host) ? "*" : host;
    }
}
