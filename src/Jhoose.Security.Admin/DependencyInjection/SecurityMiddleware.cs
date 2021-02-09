using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

using Jhoose.Security.Core.Provider;
using Microsoft.Extensions.Caching.Memory;
using EPiServer.Framework.Cache;
using System;
using Jhoose.Security.Core;

namespace Jhoose.Security.Admin.DependencyInjection
{
    public class SecurityMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ICspProvider cspProvider, ISynchronizedObjectInstanceCache cache)
        {
            var headerValue = cspProvider.HeaderValue();

            if (string.IsNullOrEmpty(headerValue)) {
            
                cache.Insert(Constants.CacheKey, headerValue, new CacheEvictionPolicy(new TimeSpan(1,0,0), CacheTimeoutType.Absolute, new[] { Constants.CacheKey} ));
            }

            context.Response.Headers.Add("Content-Security-Policy", string.Replace(headerValue, cspProvider.GenerateNonce()));

            await _next(context);
        }
    }
}
