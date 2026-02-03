
using System;
using System.Collections.Generic;
using System.Linq;

using Jhoose.Security.Features.Core.Cache;
using Jhoose.Security.Features.CSP.Provider;
using Jhoose.Security.Features.Permissions.Providers;
using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.ResponseHeaders.Providers;

using Microsoft.AspNetCore.Http;
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
public class JhooseSecurityService(ICspProvider cspProvider,
                             IResponseHeadersProvider responseHeaderProvider,
                             IPermissionsProvider permissionsProvider,
    ICacheManager cache,
    ILogger<JhooseSecurityService> logger) : IJhooseSecurityService
{
    /// <inheritdoc/>
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

    /// <inheritdoc/>
    public void AddContentSecurityPolicy(HttpResponse response)
    {
        try
        {
            // get the policy settings
            var policySettings = cspProvider.Settings;

            if (!policySettings.IsEnabled)
            {
                return;
            }

            // get the policy
            var cachedHeaders = cspProvider.PolicyHeaders().ToList();
            var nonceValue = cspProvider.GenerateNonce();
            
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
            var policySettings = cspProvider.Settings;
            if (!policySettings.IsPermissionsEnabled)
            {
                return;
            }
    
            var headerValues = permissionsProvider.PermissionPolicies();

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