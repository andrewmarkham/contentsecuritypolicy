#if NET5_0_OR_GREATER
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
using Jhoose.Security.Services;

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
            securityService.AddContentSecurityPolicy(context.Response);

            await _next(context);
        }
    }
}
#endif