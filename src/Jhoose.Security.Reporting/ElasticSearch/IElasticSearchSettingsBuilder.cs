using Elastic.Clients.Elasticsearch;

namespace Jhoose.Security.Reporting.ElasticSearch;

public interface IElasticSearchSettingsBuilder
{
    ElasticsearchClientSettings GetElasticsearchClientSettings(ElasticSearchReportingOptions options);
}
