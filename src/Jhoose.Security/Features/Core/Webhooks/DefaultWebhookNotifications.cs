using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Core.Webhooks;

/// <summary>
/// Provides default implementation for webhook notifications that posts to specified endpoints asynchronously.
/// </summary>
/// <param name="serviceScopeFactory">Factory for creating service scopes to resolve dependencies within the async task.</param>
/// <param name="logger">Logger instance for logging errors that occur during webhook notification.</param>
/// <remarks>
/// This class creates a fire-and-forget task that posts empty content to all provided webhook endpoints.
/// Errors during notification are logged but do not throw exceptions to the caller.
/// Each notification request uses an HTTP client configured with the name "webhooks".
/// </remarks>
public class DefaultWebhookNotifications(IServiceScopeFactory serviceScopeFactory, ILogger<DefaultWebhookNotifications> logger) : IWebhookNotifications
{
    /// <inheritdoc/>
    public void Notify(List<Uri> endPoints)
    {
        try
        {
            Task.Run(async () =>
            {

                using (var scope = serviceScopeFactory.CreateScope())
                {
                    var loggerFactory = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Logging.ILoggerFactory>();
                    var innerLogger = loggerFactory.CreateLogger<ILogger<DefaultWebhookNotifications>>();

                    try
                    {
                        var httpClientFactory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
                        var client = httpClientFactory.CreateClient("webhooks");

                        var c = new StringContent("");

                        foreach (var endPoint in endPoints)
                        {
                            await client.PostAsync(endPoint, c);
                        }
                    }
                    catch (Exception innerEx)
                    {
                        innerLogger.LogError(innerEx, "Error in DefaultWebhookNotifications");
                    }
                }
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in DefaultWebhookNotifications");
        }
    }
}