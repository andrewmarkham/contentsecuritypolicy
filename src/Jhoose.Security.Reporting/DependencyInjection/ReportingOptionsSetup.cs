using EPiServer.Data;

using Jhoose.Security.Core.Configuration;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Reporting.DependencyInjection
{
    public class ReportingOptionsSetup(IServiceProvider services) : IConfigureOptions<ReportingOptions>
    {
        private readonly IServiceProvider services = services;

        public void Configure(ReportingOptions options)
        {
            var jhooseOptions = services.GetService<IOptions<JhooseSecurityOptions>>()?.Value;
            var dataAccessOptions = services.GetService<IOptions<DataAccessOptions>>()?.Value;

            var episerverDB = dataAccessOptions?.ConnectionStrings.FirstOrDefault(c => c.Name == "EPiServerDB")?.ConnectionString ?? string.Empty;

            var reportingOptions = jhooseOptions?.Reporting;

            options.RateLimiting = reportingOptions?.RateLimiting ?? new RateLimiting();
            options.RetainDays = reportingOptions?.RetainDays ?? 30;
            options.ConnectionString = !string.IsNullOrEmpty(reportingOptions?.ConnectionString) ? reportingOptions.ConnectionString : episerverDB;
            options.UseProvider = !string.IsNullOrEmpty(reportingOptions?.UseProvider) ? reportingOptions.UseProvider : "Sql";
            options.Providers = reportingOptions?.Providers ?? [];
        }
    }
}