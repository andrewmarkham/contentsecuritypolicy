using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

using Jhoose.Security.Core.Provider;
using Microsoft.Extensions.Caching.Memory;
using EPiServer.Framework.Cache;
using System;
using Jhoose.Security.Core;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Cache;
using System.Collections.Generic;

namespace Jhoose.Security.DependencyInjection
{
    public class SecurityMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ICspProvider cspProvider, ICacheManager cache)
        {
            // get the policy settings
            var policySettings = cache.Get<CspSettings>(Constants.SettingsCacheKey, () => cspProvider.Settings, new TimeSpan(1,0,0));


            if (policySettings.IsEnabled)
            {
                // get the policy
                var headerValues = cache.Get<IEnumerable<CspPolicyHeader>>(Constants.PolicyCacheKey, () => cspProvider.PolicyHeaders(), new TimeSpan(1,0,0));

                foreach (var header in headerValues)
                {
                    context.Response.Headers.Add(header.Header, header.BuildValue(policySettings.ReportingUrl, cspProvider.GenerateNonce()));
                }

            }

            await _next(context);
        }
    }
}
