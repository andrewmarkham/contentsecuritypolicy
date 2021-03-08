using System;
using System.Threading;
using System.Threading.Tasks;
using Jhoose.Security.Core.Provider;
using Microsoft.Extensions.Hosting;

namespace Jhoose.Security.DependencyInjection
{
    public class InitialiseHostedService : IHostedService
    {
        private readonly IServiceProvider serviceProvider;
        public InitialiseHostedService(IServiceProvider serviceProvider)
        {
            this.serviceProvider = serviceProvider;
        }
        public Task StartAsync(CancellationToken cancellationToken)
        {
            return Task.Run(() => {
                var provider = this.serviceProvider.GetService(typeof(ICspProvider)) as ICspProvider;
                provider.Initialize();
            });
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}