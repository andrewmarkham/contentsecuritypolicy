
using System;
using System.Linq;

using Jhoose.Security.Features.Core.Providers;
using Jhoose.Security.Features.CSP.Models;

using Jhoose.Security.Features.ResponseHeaders.Models;

using Jhoose.Security.Features.Settings.Repository;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Core.Services;

/// <summary>
/// Service responsible for managing and applying security headers to HTTP responses,
/// including Content Security Policy (CSP), custom response headers, and Permissions-Policy headers.
/// </summary>
/// <remarks>
/// This service integrates with caching mechanisms to optimize header retrieval and applies
/// security headers to outgoing HTTP responses. It handles CSP directives with nonce generation,
/// custom security headers, and browser permissions policies while avoiding conflicts with existing headers.
/// </remarks>
public class JhooseSecurityService([FromKeyedServices("csp")] IHeaderProvider<CspPolicyHeaderBase> cspProvider,
                             [FromKeyedServices("responseHeaders")] IHeaderProvider<ResponseHeader> responseHeaderProvider,
                             [FromKeyedServices("permissions")] IHeaderProvider<ResponseHeader> permissionsProvider,
    ISiteService siteService, 
    ISettingsRepository settingsRepository,
    INonceService nonceService,
    ILogger<JhooseSecurityService> logger) : IJhooseSecurityService
{
    /// <inheritdoc/>
    public void AddHeaders(HttpResponse response)
    {
        try
        {

            var siteId = siteService.ResolveSiteId(response) ?? string.Empty;
            
            var headerValues = responseHeaderProvider.Headers(siteId, response.HttpContext.Request.Host.Host);

            var enabledHeaders = headerValues?.Where(h => h.Enabled) ?? [];

            foreach (var header in enabledHeaders)
            {
                if (response.Headers.ContainsKey(header.Name))
                {
                    logger.LogWarning("Header : {Name} already exists in the reponse, the Jhoose CSP module will not override this", header.Name);
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

    /// <inheritdoc/>
    public void AddContentSecurityPolicy(HttpResponse response)
    {
        try
        {
            // get the policy settings
            var policySettings = settingsRepository.Load();

            var siteId = siteService.ResolveSiteId(response) ?? string.Empty;
            if (!policySettings.IsEnabledForSite(siteId))
            {
                return;
            }

            // get the policy
            var cachedHeaders = cspProvider.Headers(siteId, response.HttpContext.Request.Host.Host).ToList();
            var nonceValue = nonceService.GenerateNonce();
            
            foreach (var cachedHeader in cachedHeaders)
            {
                var header = cachedHeader.Clone();
                header.NonceValue = nonceValue;

                if (response.Headers.ContainsKey(header.Name))
                {
                    if (logger.IsEnabled(LogLevel.Warning))
                        logger.LogWarning("Header : {Name} already exists in the reponse, the Jhoose CSP module will not override this", header.Name);
                }
                else
                {
                    response.Headers.Append(header.Name, header.Value);
                }
            }
            

        }
        catch (Exception ex)
        {
            // Error is logged, but will not stop execution.
            logger.LogError(ex, "Failed to add header");
        }
    }

    /// <inheritdoc/>
    public void AddPermissionsPolicy(HttpResponse response)
    {
        try
        {
            // get the policy settings
            var policySettings = settingsRepository.Load();
            var siteId = siteService.ResolveSiteId(response);
            if (!policySettings.IsPermissionsEnabledForSite(siteId))
            {
                return;
            }
    
            var headerValues = permissionsProvider.Headers(siteId, response.HttpContext.Request.Host.Host);

            foreach (var header in headerValues)
            {
                if (response.Headers.ContainsKey(header.Name))
                {
                    if (logger.IsEnabled(LogLevel.Warning))
                        logger.LogWarning("Header : {Name} already exists in the reponse, the Jhoose Permissions-Policy module will not override this", header.Name);
                }
                else
                {
                    response.Headers.Append(header.Name, header.Value);
                }
            }
        }
        catch (Exception ex)
        {
            // Error is logged, but will not stop execution.
            logger.LogError(ex, "Failed to add Permissions-Policy header");
        }
    }


}
