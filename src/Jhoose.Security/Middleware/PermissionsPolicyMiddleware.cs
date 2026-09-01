using System.Threading.Tasks;

using Jhoose.Security.Features.Core.Services;

using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Middleware;

public class PermissionsPolicyMiddleware
{
    private readonly RequestDelegate _next;

    public PermissionsPolicyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IJhooseSecurityService securityService)
    {
        if (!context.Response.HasStarted)
        {
            securityService.AddPermissionsPolicy(context.Response);
        }

        await _next(context);
    }
}
