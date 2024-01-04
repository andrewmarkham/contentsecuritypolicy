using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Castle.Core.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Webhooks
{
    public class DefaultWebhookNotifications : IWebhookNotifications
    {
        private readonly IServiceScopeFactory serviceScopeFactory;
        private readonly ILogger<DefaultWebhookNotifications> logger;

        public DefaultWebhookNotifications(IServiceScopeFactory serviceScopeFactory, ILogger<DefaultWebhookNotifications> logger)
        {
            this.serviceScopeFactory = serviceScopeFactory;
            this.logger = logger;
        }

        public void Notify(List<Uri> endPoints)
        {
            try {
                Task.Run(async () => {

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
                this.logger.LogError(ex, "Error in DefaultWebhookNotifications");
            } 

        }
    }
}

