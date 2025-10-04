using Jhoose.Security.Core.Configuration;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;





#if NET7_0_OR_GREATER
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace Jhoose.Security.Reporting.DependencyInjection;

public class RateLimitingOptionsSetup(IServiceProvider services) : IConfigureOptions<RateLimiterOptions>
{
    private readonly IServiceProvider services = services;

    public void Configure(RateLimiterOptions options)
    {
        var jhooseOptions = services.GetService<IOptions<JhooseSecurityOptions>>()?.Value;
        var rateLimiting = jhooseOptions?.Reporting?.RateLimiting;
        if (rateLimiting?.Enabled ?? false)
        {
            options.AddFixedWindowLimiter("fixed", o =>
            {
                o.PermitLimit = rateLimiting?.PermitLimit ?? 100;
                o.QueueLimit = rateLimiting?.QueueLimit ?? 100;
                o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                o.Window = TimeSpan.FromSeconds(rateLimiting?.WindowSeconds ?? 60);
            });
        }
    }
}
#endif