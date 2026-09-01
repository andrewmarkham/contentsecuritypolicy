
using Jhoose.Security.Configuration;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

using MyCSharp.HttpUserAgentParser.DependencyInjection;
using Jhoose.Security.Features.Reporting.Database;
using Jhoose.Security.Features.Reporting.ElasticSearch;

namespace Jhoose.Security.Features.Reporting.DependencyInjection;

public static class SecurityExtensions
{
    public static IServiceCollection AddJhooseSecurityCoreReporting(this IServiceCollection services)
    {

        services.AddHttpUserAgentParser();

        services.AddSingleton<IReportingRepositoryFactory, ReportingRepositoryFactory>();

        // ElasticSearch
        services.AddSingleton<IReportingRepository, ElasticSearchReportingRepository>();
        services.AddSingleton<IElasticSearchSettingsBuilder, ElasticSearchSettingsBuilder>();
        services.ConfigureOptions<ElasticSearchReportingOptionsSetup>();

        // SQL
        services.AddSingleton<IReportingRepository, SqlDatabaseReportingRepository>();

        services.AddSingleton<IDashboardService, DashboardService>();

        services.AddControllers()
                .AddMvcOptions(o => o.InputFormatters.Insert(0, new Controllers.ProblemJsonFormatter()));

        services.ConfigureOptions<ReportingOptionsSetup>();

        services.AddRateLimiter(_ => { }); 
        services.ConfigureOptions<RateLimitingOptionsSetup>();

        return services;
    }

    public static IApplicationBuilder UseJhooseSecurityReporting(this IApplicationBuilder applicationBuilder)
    {
        var jhooseOptions = applicationBuilder.ApplicationServices.GetService<IOptions<ReportingOptions>>()?.Value;
        var rateLimiting = jhooseOptions?.RateLimiting;
        if (rateLimiting?.Enabled ?? false)
        {
            applicationBuilder.UseRateLimiter();
        }

        return applicationBuilder;
    }
}