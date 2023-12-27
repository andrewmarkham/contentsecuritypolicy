using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
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
            if (!context.Response.HasStarted)
            {
                securityService.AddHeaders(context.Response);
            }

            await _next(context);
        }
    }
}