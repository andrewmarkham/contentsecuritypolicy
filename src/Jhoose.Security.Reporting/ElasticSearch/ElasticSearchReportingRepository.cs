using System.Net;

using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.Aggregations;
using Elastic.Clients.Elasticsearch.QueryDsl;

using EPiServer.Shell;

using Jhoose.Security.Reporting.Models;
using Jhoose.Security.Reporting.Models.Dashboard;
using Jhoose.Security.Reporting.Models.Search;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Reporting.ElasticSearch;

public class ElasticSearchReportingRepository : IReportingRepository
{
    private const string IndexName = "reporting";

    private readonly IElasticSearchSettingsBuilder settingsBuilder;
    private readonly IOptions<ElasticSearchReportingOptions> options;
    private readonly ILogger<ElasticSearchReportingRepository> logger;

    private readonly Lazy<ElasticsearchClient> client;

    protected bool? HasIndex { get; set; }

    public string Type => "ElasticSearch";

    public ElasticSearchReportingRepository(IElasticSearchSettingsBuilder settingsBuilder, IOptions<ElasticSearchReportingOptions> options, ILogger<ElasticSearchReportingRepository> logger)
    {
        this.settingsBuilder = settingsBuilder;
        this.options = options;
        this.logger = logger;

        this.client = new(() =>
        {
            var settings = settingsBuilder.GetElasticsearchClientSettings(options.Value);
            settings.DefaultIndex(options.Value.IndexName);

            return new ElasticsearchClient(settings);
        });
    }
    public async Task AddReport(ReportTo reportTo)
    {
        await CreateIndexIsNeeded();
        var response = await client.Value.IndexAsync(reportTo,
                                i => i.Index(IndexName));
    }

    public async Task<DashboardSummary> GetDashboardSummary(DashboardSummary summary)
    {
        await CreateIndexIsNeeded();

        var buckets = CalculateBucketSize(summary.Query.Timeframe);

        var r = await client.Value.SearchAsync<ReportTo>(s => s.Index(options.Value.IndexName)
                                .Query(query => query.Bool(b => b.Must(m => m.Range(r => r.DateRange(dr => dr.Field(f => f.RecievedAt).Gte(summary.Query.From).Lte(summary.Query.To))))))
                                .Aggregations(agg =>
                                    agg.Add("directives",
                                            ad => ad.Terms(s => s.Field(f => f.Directive).Size(5)))
                                       .Add("urls", ad =>
                                            ad.Terms(s => s.Field(f => f.Url).Size(5)))
                                       .Add("graph", ad =>
                                            ad.AutoDateHistogram(s => s.Field(f => f.RecievedAt)
                                                    .Buckets(buckets))
                                                    .Aggregations(agg =>
                                                        agg.Add("browser",
                                                                ad => ad.Terms(s => s.Field(f => f.Browser).Size(5)))
                                                            .Add("directive",
                                                                ad => ad.Terms(s => s.Field(f => f.Directive).Size(5)))
                                                            .Add("page", ad =>
                                                                ad.Terms(s => s.Field(f => f.Url).Size(5)
                                                            ))))
                                ).Size(0));

        summary.Total = (int)r.Total;

        if (r.Aggregations != null)
        {
            foreach (var agg in r.Aggregations)
            {
                switch (agg.Key)
                {
                    case "directives":
                        summary.TopDirectives = GetDashboardIssues(agg.Value, "directive");
                        break;
                    case "urls":
                        summary.TopPages = GetDashboardIssues(agg.Value, "page");
                        break;
                    case "graph":
                        summary.Errors = GetDashboardErrors(agg.Value, summary.Query.Type).ToList();
                        break;
                }
            }
        }

        return summary;
    }

    public async Task<int> PurgeReporingData(DateTime beforeDate)
    {
        var response = await this.client.Value.DeleteByQueryAsync<ReportTo>(d => d.Query(query => query.Bool(b => b.Must(m => m.Range(r => r.DateRange(dr => dr.Field(f => f.RecievedAt).Gte(beforeDate)))))));

        var deletedCount = response.Deleted ?? 0;
        return (int)deletedCount;
    }

    public async Task<CspSearchResults> Search(CspSearchParams searchParams)
    {
        await CreateIndexIsNeeded();

        var from = (searchParams.Page - 1) * searchParams.PageSize;
        var sortOrder = searchParams.SortOrder == "ascend" ? SortOrder.Asc : SortOrder.Desc;


        var response = await client.Value.SearchAsync<ReportTo>(s => s.Index(IndexName)
                    .Query(q => BuildSearchQuery(q, searchParams))
                    .From(from)
                    .Size(searchParams.PageSize)
                    .Sort(s => s.Field(f => f.RecievedAt, new FieldSort { Order = sortOrder }))
                                        .Aggregations(agg =>
                                agg.Add("directives",
                                        ad => ad.Terms(s => s.Field(f => f.Directive).Size(20)))
                                    .Add("browsers", ad =>
                                        ad.Terms(s => s.Field(f => f.Browser).Size(20)))));

        var r = response.Documents.Select(d => new CspSearchResult
        {
            Id = Guid.NewGuid().ToString(),
            Age = d.Age,
            RecievedAt = d.RecievedAt,
            Type = d.Directive,
            Url = d.Url,
            UserAgent = d.Browser,
            Browser = d.Browser,
            Version = d.Browser,
            Os = d.Browser,
            Directive = d.Directive,
            BlockedUri = d.BlockedUri,
            Body = new BodyData
            {
                DocumentUrl = d.Body.DocumentURL,
                Disposition = d.Body.Disposition,
                Referrer = d.Body.Referrer,
                EffectiveDirective = d.Body.EffectiveDirective,
                BlockedUrl = d.Body.BlockedURL,
                OriginalPolicy = d.Body.OriginalPolicy,
                StatusCode = d.Body.StatusCode ?? -1,
                Sample = d.Body.Sample,
                SourceFile = d.Body.SourceFile,
                LineNumber = d.Body.LineNumber ?? -1,
                ColumnNumber = d.Body.ColumnNumber ?? -1
            }
        }).ToList();

        return new CspSearchResults
        {
            Total = response.Total,
            Results = r,
            Browsers = GetSearchAggregations(response?.Aggregations?.FirstOrDefault(a => a.Key == "browsers").Value),
            Directives = GetSearchAggregations(response?.Aggregations?.FirstOrDefault(a => a.Key == "directives").Value)
        };
    }
    protected virtual async Task CreateIndexIsNeeded()
    {
        if (HasIndex ?? false)
        {
            return;
        }

        var response = await client.Value.Indices.ExistsAsync(IndexName);

        if (!response.Exists)
        {

            await client.Value.Indices.CreateAsync<ReportTo>(IndexName,
                index => index.Mappings(m =>
                m.Properties(p =>
                    p.Keyword(t => t.Directive)
                     .Keyword(t => t.Browser)
                     .Keyword(t => t.Url)
                     .Date(t => t.RecievedAt))));
        }

        HasIndex = true;
    }

    protected static int CalculateBucketSize(string timeframe)
    {
        int buckets = 0;
        switch (timeframe)
        {
            case "30m":
                buckets = 30;
                break;
            case "1h":
                buckets = 60;
                break;
            case "6h":
                buckets = 60;
                break;
            case "12h":
                buckets = 120;
                break;
            case "1d":
                buckets = 120;
                break;
            case "3d":
                buckets = 120 * 3;
                break;
            case "7d":
                buckets = 120 * 7;
                break;
        }
        return buckets;
    }

    private static IEnumerable<DashboardGraphItem> GetDashboardErrors(IAggregate aggregate, string type)
    {
        if (aggregate is AutoDateHistogramAggregate dates)
        {
            foreach (var date in dates.Buckets)
            {
                var agg = date.Aggregations.FirstOrDefault(a => a.Key == type);
                var issues = GetDashboardIssues(agg.Value, "date");

                foreach (var issue in issues)
                {
                    yield return new DashboardGraphItem
                    {
                        Time = DateTime.Parse(date.KeyAsString, styles: System.Globalization.DateTimeStyles.AssumeUniversal).ToUniversalTime(),
                        Metric = issue.Name,
                        Value = issue.Count
                    };
                }
            }
        }
    }

    private static List<DashboardIssue> GetDashboardIssues(IAggregate aggregate, string section)
    {
        var path = Paths.ToResource("Jhoose.Security", "jhoosesecurityadmin#/");

        if (aggregate is StringTermsAggregate terms)
        {
            return terms.Buckets.Select(b => new DashboardIssue
            {
                Name = b.Key.ToString(),
                Url = $"{path}cspissues?{section}={WebUtility.UrlEncode(b.Key.ToString())}",
                Count = (int)b.DocCount
            }).ToList();
        }

        return [];
    }

    private static List<string> GetSearchAggregations(IAggregate? aggregate)
    {
        if (aggregate is StringTermsAggregate terms)
        {
            return terms.Buckets.Select(b => b.Key.ToString()).ToList();
        }

        return [];
    }

    private QueryDescriptor<ReportTo> BuildSearchQuery(QueryDescriptor<ReportTo> q, CspSearchParams searchParams)
    {
        var filters = new List<Elastic.Clients.Elasticsearch.QueryDsl.Query>();
        var must = new QueryDescriptor<ReportTo>();

        must.MatchAll(m => m.QueryName("all"));

        if (searchParams.Filters?.DateFrom.HasValue ?? false)
        {
            filters.Add(new DateRangeQuery(Infer.Field<ReportTo>(f => f.RecievedAt))
            {
                Gte = searchParams.Filters.DateFrom
            });
        }

        if (searchParams.Filters?.Browser?.Count > 0)
        {
            filters.Add(new TermsQuery
            {
                Field = Infer.Field<ReportTo>(f => f.Browser),
                Terms = new TermsQueryField(searchParams.Filters.Browser.Select(d => FieldValue.String(d)).ToList())
            });
        }

        if (searchParams.Filters?.Directive?.Count > 0)
        {
            filters.Add(new TermsQuery
            {
                Field = Infer.Field<ReportTo>(f => f.Directive),
                Terms = new TermsQueryField(searchParams.Filters.Directive.Select(d => FieldValue.String(d)).ToList())
            });
        }

        if (!string.IsNullOrEmpty(searchParams?.Filters?.Query))
        {

            must.SimpleQueryString(new SimpleQueryStringQuery
            {
                Fields = Infer.Fields<ReportTo>(f => f.Url, f => f.BlockedUri),
                Query = searchParams?.Filters?.Query ?? string.Empty,
                Analyzer = "keyword"
            });
        }

        return q.Bool(b => b.Must(must).Filter(filters));
    }
}