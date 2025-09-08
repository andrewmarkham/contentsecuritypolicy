using System.Net.Mime;
using System.Threading.Tasks;

using Jhoose.Security.Services;

using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;

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

            context.Response.OnStarting(() =>
            {
                var response = context.Response;
                // Strip on 304 Not Modified and non-HTML/JS responses
                if (
                    response.StatusCode == StatusCodes.Status304NotModified
                    || response.Headers.TryGetValue(HeaderNames.ContentType, out var contentType)
                        && !contentType.ToString().StartsWith(MediaTypeNames.Text.Html)
                        && !contentType.ToString().StartsWith("text/javascript") // MediaTypeNames.Text.JavaScript is not available in .NET < 8
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
}