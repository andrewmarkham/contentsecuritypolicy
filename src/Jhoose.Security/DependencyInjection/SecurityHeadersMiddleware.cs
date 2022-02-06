using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using System.Linq;

namespace Jhoose.Security.DependencyInjection
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IOptions<SecurityOptions> options)
        {
            var securityOptions = options.Value;
            
            var enabledHeaders = securityOptions.Headers.Where(h => h.Enabled);

            foreach(var header in enabledHeaders)
            {
                context.Response.Headers.Add(header.Name, header.Value);
            }

            await _next(context);
        }
    }
}
