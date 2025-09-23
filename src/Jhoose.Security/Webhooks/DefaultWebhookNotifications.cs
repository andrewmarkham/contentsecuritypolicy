using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Webhooks
{
    public class DefaultWebhookNotifications(IServiceScopeFactory serviceScopeFactory, ILogger<DefaultWebhookNotifications> logger) : IWebhookNotifications
    {
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
}

