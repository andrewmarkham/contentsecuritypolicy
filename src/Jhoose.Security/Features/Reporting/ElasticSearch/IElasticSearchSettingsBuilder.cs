using Elastic.Clients.Elasticsearch;

namespace Jhoose.Security.Features.Reporting.ElasticSearch;

public interface IElasticSearchSettingsBuilder
{
    ElasticsearchClientSettings GetElasticsearchClientSettings(ElasticSearchReportingOptions options);
}