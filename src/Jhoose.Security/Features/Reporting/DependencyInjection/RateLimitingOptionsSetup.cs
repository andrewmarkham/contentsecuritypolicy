using Jhoose.Security.Configuration;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using System;

namespace Jhoose.Security.Features.Reporting.DependencyInjection;

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
                o.PermitLimit = rateLimiting?.PermitLimit ?? 10000;
                o.QueueLimit = rateLimiting?.QueueLimit ?? 10000;
                o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                o.Window = TimeSpan.FromSeconds(rateLimiting?.WindowSeconds ?? 60);
            });
        }
    }
}
