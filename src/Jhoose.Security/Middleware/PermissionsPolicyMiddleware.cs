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
        // Deferred to OnStarting (see ContentSecurityPolicyMiddleware for the full explanation) -
        // EPiServer only resolves IContentRouteHelper.Content once the endpoint has executed,
        // which happens inside _next(context), not before it.
        context.Response.OnStarting(() =>
        {
            if (!context.Response.HasStarted)
            {
                securityService.AddPermissionsPolicy(context.Response);
            }
            return Task.CompletedTask;
        });

        await _next(context);
    }
}
