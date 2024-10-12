
using Jhoose.Security.Reporting.ElasticSearch;
using Microsoft.AspNetCore.Builder;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyCSharp.HttpUserAgentParser.DependencyInjection;
using Jhoose.Security.Reporting.Database;
using Microsoft.Extensions.Options;
using Jhoose.Security.Core.Configuration;




#if NET7_0_OR_GREATER
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
#endif

namespace Jhoose.Security.Reporting.DependencyInjection
{
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
}