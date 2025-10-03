
using Jhoose.Security.Core.Configuration;
using Jhoose.Security.Reporting.Database;
using Jhoose.Security.Reporting.ElasticSearch;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

using MyCSharp.HttpUserAgentParser.DependencyInjection;




#if NET7_0_OR_GREATER
#pragma warning disable IDE0005 // Using directive is unnecessary.
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
#pragma warning restore IDE0005 // Using directive is unnecessary.
#endif

namespace Jhoose.Security.Reporting.DependencyInjection;

public static class SecurityExtensions
{
    public static IServiceCollection AddJhooseSecurityCoreReporting(this IServiceCollection services)
    {

        services.AddHttpUserAgentParser();

        services.AddHostedService<SqlInit>();

        services.AddSingleton<IReportingRepositoryFactory, ReportingRepositoryFactory>();

        // ElasticSearch
        services.AddSingleton<IReportingRepository, ElasticSearchReportingRepository>();
        services.AddSingleton<IElasticSearchSettingsBuilder, ElasticSearchSettingsBuilder>();
        services.ConfigureOptions<ElasticSearchReportingOptionsSetup>();

        // SQL
        services.AddSingleton<ISqlHelper, SqlHelper>();
        services.AddSingleton<IReportingRepository, SqlDatabaseReportingRepository>();

        services.AddSingleton<IDashboardService, DashboardService>();

        services.AddControllers()
                .AddMvcOptions(o => o.InputFormatters.Insert(0, new Controllers.ProblemJsonFormatter()));

        services.ConfigureOptions<ReportingOptionsSetup>();

#if NET7_0_OR_GREATER
        services.AddRateLimiter(_ => { }); 
        services.ConfigureOptions<RateLimitingOptionsSetup>();
#endif
        return services;
    }

    public static IApplicationBuilder UseJhooseSecurityReporting(this IApplicationBuilder applicationBuilder)
    {
        var jhooseOptions = applicationBuilder.ApplicationServices.GetService<IOptions<ReportingOptions>>()?.Value;
        var rateLimiting = jhooseOptions?.RateLimiting;
        if (rateLimiting?.Enabled ?? false)
        {
#if NET7_0_OR_GREATER
            applicationBuilder.UseRateLimiter();
#endif
        }

        return applicationBuilder;
    }
}