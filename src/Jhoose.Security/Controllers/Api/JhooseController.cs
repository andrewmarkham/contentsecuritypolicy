
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

using Jhoose.Security.Authorization;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.CSP;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Core.Repository;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Controllers.Api;

[Route("api/[controller]")]
[ApiController]
public class JhooseController(ICspProvider cspProvider,
    ISettingsRepository settingsRepository,
    IResponseHeadersProvider responseHeaderProvider,
    IPermissionsProvider permissionsProvider,
    ICacheManager cache,
    ILogger<JhooseController> logger) : ControllerBase
{
    public class HeaderRequest
    {
        public string Nonce { get; set; } = string.Empty;
    }

    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

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
        var headerValues = cache.Get<List<ResponseHeader>>(Core.Constants.ResponseHeadersCacheKey,
            () => [.. responseHeaderProvider.ResponseHeaders().Where(h => h.Enabled)], new TimeSpan(1, 0, 0));


        foreach (var header in headerValues)
        {
            yield return new KeyValuePair<string, string>(header.Name, header.Value);
        }
    }

    private IEnumerable<KeyValuePair<string, string>> GetContentSecurityPolicy(string nonce)
    {
        // get the policy settings
        var policySettings = cache.Get<CspSettings>(Core.Constants.SettingsCacheKey, () => settingsRepository.Settings(),
            new TimeSpan(1, 0, 0));

        if (policySettings.IsEnabled)
        {
            // get the policy
            var headerValues = cache.Get<List<CspPolicyHeaderBase>>(Core.Constants.PolicyCacheKey,
                () => [.. cspProvider.PolicyHeaders()], new TimeSpan(1, 0, 0));

            foreach (var header in headerValues)
            {
                header.NonceValue = nonce;
                yield return new KeyValuePair<string, string>(header.Name, header.Value);
            }
        }
    }

    private IEnumerable<KeyValuePair<string, string>> GetContentPermissionsPolicy()
    {
        // get the policy settings
        var policySettings = cache.Get<CspSettings>(Core.Constants.SettingsCacheKey, () => settingsRepository.Settings(),
            new TimeSpan(1, 0, 0));

        if (policySettings.IsPermissionsEnabled)
        {
            // get the policy
            var headerValues = cache.Get<List<ResponseHeader>>(Core.Constants.PermissionPolicyCacheKey,
                () => [.. permissionsProvider.PermissionPolicies()], new TimeSpan(1, 0, 0));

            foreach (var header in headerValues)
            {
                yield return new KeyValuePair<string, string>(header.Name, header.Value);
            }
        }
    }
}