using System.Threading.Tasks;

using Jhoose.Security.Services;

using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IJhooseSecurityService securityService)
    {
        if (!context.Response.HasStarted)
        {
            securityService.AddHeaders(context.Response);
        }

        await _next(context);
    }
}