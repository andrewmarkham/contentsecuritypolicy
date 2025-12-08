using System;
using System.Linq;

using Elastic.Clients.Elasticsearch;
using Elastic.Transport;

namespace Jhoose.Security.Features.Reporting.ElasticSearch;

public class ElasticSearchSettingsBuilder : IElasticSearchSettingsBuilder
{
    public virtual ElasticsearchClientSettings GetElasticsearchClientSettings(ElasticSearchReportingOptions options)
    {
        if (!string.IsNullOrEmpty(options.CloudId))
        {
            return SettingsForElasticCloud(options);
        }
        else if (options.Servers.Count == 1)
        {
            return SettingsForSingleNode(options);
        }
        else if (options.Servers.Count > 1)
        {
            return SettingsForMultipleNodes(options);
        }

        throw new ArgumentException("No valid configuration found for Elasticsearch");
    }

    protected virtual ElasticsearchClientSettings SettingsForSingleNode(ElasticSearchReportingOptions options)
    {
        ArgumentException.ThrowIfNullOrEmpty(options.CertificateFingerprint, nameof(options.CertificateFingerprint));
        ArgumentException.ThrowIfNullOrEmpty(options.UserName, nameof(options.UserName));
        ArgumentException.ThrowIfNullOrEmpty(options.Password, nameof(options.Password));


        return new ElasticsearchClientSettings(options.Servers.First())
            .CertificateFingerprint(options.CertificateFingerprint)
            .Authentication(new BasicAuthentication(options.UserName, options.Password));
    }

    protected virtual ElasticsearchClientSettings SettingsForMultipleNodes(ElasticSearchReportingOptions options)
    {

        ArgumentException.ThrowIfNullOrEmpty(options.ApiKey, nameof(options.ApiKey));


        var pool = new StaticNodePool(options.Servers);
        return new ElasticsearchClientSettings(pool)
                    .CertificateFingerprint(options.CertificateFingerprint)
                    .Authentication(new ApiKey(options.ApiKey));
    }

    protected virtual ElasticsearchClientSettings SettingsForElasticCloud(ElasticSearchReportingOptions options)
    {
        return new ElasticsearchClientSettings(options.CloudId, new ApiKey(options.ApiKey));
    }
}