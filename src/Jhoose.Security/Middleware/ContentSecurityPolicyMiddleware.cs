using System.Net.Mime;
using System.Threading.Tasks;

using Jhoose.Security.Features.Core.Services;

using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;

namespace Jhoose.Security.Middleware;

public class ContentSecurityPolicyMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    public async Task InvokeAsync(HttpContext context, IJhooseSecurityService securityService)
    {
        // Deferred to OnStarting (rather than added eagerly here, before _next runs) because
        // page-level CSP overrides need EPiServer's current content resolved via
        // IContentRouteHelper, which only happens once the endpoint (controller/view) has
        // executed - not yet at this point in the pipeline, even though this middleware itself
        // is registered after UseRouting(). OnStarting fires right before the response is sent,
        // i.e. after content resolution has happened, so it's the earliest safe point.
        context.Response.OnStarting(() =>
        {
            var response = context.Response;

            if (!response.HasStarted)
            {
                securityService.AddContentSecurityPolicy(response);
            }

            // Strip on 304 Not Modified and non-HTML/JS responses
            if (
                response.StatusCode == StatusCodes.Status304NotModified
                || response.Headers.TryGetValue(HeaderNames.ContentType, out var contentType)
                    && !contentType.ToString().StartsWith(MediaTypeNames.Text.Html)
                    // MediaTypeNames.Text.JavaScript is not available in .NET < 8
                    && !contentType.ToString().StartsWith("text/javascript")
            )
            {
                response.Headers.Remove(HeaderNames.ContentSecurityPolicy);
                response.Headers.Remove(HeaderNames.ContentSecurityPolicyReportOnly);
            }

            return Task.CompletedTask;
        });

        await _next(context);
    }
}
