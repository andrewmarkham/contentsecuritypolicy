using System.Threading.Tasks;

using Jhoose.Security.Configuration;
using Jhoose.Security.DependencyInjection;
using Jhoose.Security.Features.Core.Services;
using Jhoose.Security.Features.IpRestrictions;
using Jhoose.Security.Features.IpRestrictions.Services;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Middleware;

public class IpRestrictionMiddleware
{
    private readonly RequestDelegate _next;

    public IpRestrictionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        IIpRestrictionService ipRestrictionService,
        IIpRestrictionIgnoredPathService ignoredPathService,
        IIpRestrictionIgnoreHeaderService ignoreHeaderService,
        ISiteService siteService,
        IOptions<JhooseSecurityOptions> options)
    {
        var securityOptions = options.Value;

        if (!IsInScope(context.Request, securityOptions))
        {
            await _next(context);
            return;
        }

        var siteId = siteService.ResolveSiteId(context.Request.Host.Value) ?? string.Empty;

        if (ignoredPathService.IsIgnored(siteId, context.Request))
        {
            await _next(context);
            return;
        }

        if (ignoreHeaderService.IsIgnored(siteId, context.Request))
        {
            await _next(context);
            return;
        }

        var clientIp = ClientIpResolver.Resolve(context.Request);

        if (clientIp != null && !ipRestrictionService.IsAllowed(siteId, clientIp))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return;
        }

        await _next(context);
    }

    public static bool IsInScope(HttpRequest request, JhooseSecurityOptions options)
    {
        return options.IpRestrictionScope switch
        {
            IpRestrictionScope.Off => false,
            IpRestrictionScope.Both => true,
            IpRestrictionScope.PublicSite => SecurityExtensions.IsValidPath(request, options.ExclusionPaths),
            IpRestrictionScope.CmsSite => !SecurityExtensions.IsValidPath(request, options.ExclusionPaths),
            _ => true
        };
    }
}
