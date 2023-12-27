using System.Threading.Tasks;
using Jhoose.Security.Services;
using Microsoft.AspNetCore.Http;

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