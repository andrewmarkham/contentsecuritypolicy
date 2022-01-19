using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;

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
            
            context.Response.Headers.Add(securityOptions.StrictTransportSecurity.Name, securityOptions.StrictTransportSecurity.Value);

            context.Response.Headers.Add(securityOptions.XFrameOptions.Name, securityOptions.XFrameOptions.Value);

            context.Response.Headers.Add(securityOptions.XContentTypeOptions.Name, securityOptions.XContentTypeOptions.Value);
            context.Response.Headers.Add(securityOptions.XPermittedCrossDomainPolicies.Name, securityOptions.XPermittedCrossDomainPolicies.Value);
            context.Response.Headers.Add(securityOptions.ReferrerPolicy.Name, securityOptions.ReferrerPolicy.Value);
            context.Response.Headers.Add(securityOptions.CrossOriginEmbedderPolicy.Name, securityOptions.CrossOriginEmbedderPolicy.Value);
            context.Response.Headers.Add(securityOptions.CrossOriginOpenerPolicy.Name, securityOptions.CrossOriginOpenerPolicy.Value);
            context.Response.Headers.Add(securityOptions.CrossOriginResourcePolicy.Name, securityOptions.CrossOriginResourcePolicy.Value);


            await _next(context);
        }
    }
}
