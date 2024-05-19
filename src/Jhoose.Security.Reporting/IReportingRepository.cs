using Jhoose.Security.Reporting.Models;

using Elastic.Clients.Elasticsearch;
using Elastic.Transport;

namespace Jhoose.Security.Reporting;
public interface IReportingRepository
{
    Task AddReport(ReportTo reportTo);
}   

public class ElasticSearchReportingRepository : IReportingRepository
{
    private readonly ElasticsearchClient client;

    public ElasticSearchReportingRepository()
    {
        var settings = new ElasticsearchClientSettings(new Uri("https://localhost:9200"))
            .CertificateFingerprint("9F:FE:19:A9:F4:1F:80:CA:E8:F2:32:4A:C4:FB:37:29:AD:35:EB:5B:FF:08:F4:C1:35:D6:37:3B:2C:93:DE:D7")
            .Authentication(new BasicAuthentication("elastic", "K==L95bYTa_B3KejnLD+"));

        client = new ElasticsearchClient(settings);
    }
    public async Task AddReport(ReportTo reportTo)
    {
        var response = await client.IndexAsync<ReportTo>(reportTo, i => i.Index("reporting"));

        var r = await client.SearchAsync<ReportTo>(s => s.Index("reporting")
                                .From(0)
                                .Size(10)
                                .Aggregations(a => a.Add("reporting", r => r.Terms(t => t.Field(f => f.Body.EffectiveDirective))))
                                );
    }
}