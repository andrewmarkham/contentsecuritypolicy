#if NET5_0_OR_GREATER
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EPiServer.Framework.Cache;
using Jhoose.Security.Core;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;

namespace Jhoose.Security.Middleware
{
    public class ContentSecurityPolicyMiddleware
    {
        private readonly RequestDelegate _next;

        public ContentSecurityPolicyMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IJhooseSecurityService securityService)
        {
            if (!context.Response.HasStarted)
            {
                securityService.AddContentSecurityPolicy(context.Response);
            }
            await _next(context);
        }
    }
}
#endif