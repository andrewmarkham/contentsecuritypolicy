#if NET5_0_OR_GREATER
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using System.Linq;
using Jhoose.Security.Services;

namespace Jhoose.Security.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IJhooseSecurityService securityService, IOptions<JhooseSecurityOptions> options)
        {
            securityService.AddHeaders(context.Response,options.Value.Headers);

            await _next(context);
        }
    }
}
#endif