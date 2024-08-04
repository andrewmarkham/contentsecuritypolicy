using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Jhoose.Security.Core.Configuration;


namespace Jhoose.Security.Reporting.ElasticSearch
{
    public class ElasticSearchReportingOptionsSetup : IConfigureOptions<ElasticSearchReportingOptions>
    {
        private readonly IServiceProvider services;

        public ElasticSearchReportingOptionsSetup(IServiceProvider services)
        {
            this.services = services;
        }

        public void Configure(ElasticSearchReportingOptions options)
        {
            var jhooseOptions = services.GetService<IOptions<JhooseSecurityOptions>>()?.Value;


            var provider = jhooseOptions?.Reporting?.Providers?.FirstOrDefault(p => p.Type == "ElasticSearch");
            if (provider != null)
            {
                options.ApiKey = GetParamValue(provider.Params, nameof(ElasticSearchReportingOptions.ApiKey), string.Empty);
                options.UserName = GetParamValue(provider.Params, nameof(ElasticSearchReportingOptions.UserName), string.Empty);
                options.Password = GetParamValue(provider.Params, nameof(ElasticSearchReportingOptions.Password), string.Empty);

                options.IndexName = GetParamValue(provider.Params, nameof(ElasticSearchReportingOptions.IndexName), string.Empty);
                options.CertificateFingerprint  = GetParamValue(provider.Params, nameof(ElasticSearchReportingOptions.CertificateFingerprint), string.Empty);
                options.CloudId = GetParamValue(provider.Params, nameof(ElasticSearchReportingOptions.CloudId), string.Empty);
                options.EndPoints = [.. GetParamValue(provider.Params, nameof(ElasticSearchReportingOptions.EndPoints), string.Empty).Split(';')];
            }
        }

        private static string GetParamValue(IDictionary<string, string> parameters, string key, string defaultValue)
        {
            if (parameters.TryGetValue(key, out var value))
            {
                return value;
            }

            return defaultValue;
        }
    }
}