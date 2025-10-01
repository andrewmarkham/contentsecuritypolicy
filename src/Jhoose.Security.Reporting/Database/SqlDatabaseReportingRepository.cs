using System.Data;
using System.Net;
using System.Text.Json;

using EPiServer.Shell;

using Jhoose.Security.Reporting.Models;
using Jhoose.Security.Reporting.Models.Dashboard;
using Jhoose.Security.Reporting.Models.Search;

using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Reporting.Database
{
    public class SqlDatabaseReportingRepository : IReportingRepository
    {
        private readonly ISqlHelper sqlHelper;
        private readonly ILogger<SqlDatabaseReportingRepository> logger;

        public SqlDatabaseReportingRepository(ILogger<SqlDatabaseReportingRepository> logger, ISqlHelper sqlHelper)
        {
            this.sqlHelper = sqlHelper;
            this.logger = logger;
        }

        public string Type => "Sql";

        public async Task AddReport(ReportTo reportTo)
        {
            var sqlCommand = """
                    INSERT INTO SecurityReportTo 
                        (Age, RecievedAt, RecievedAtMin, RecievedAtHour, Type, Url, UserAgent, Browser, Version, OS, Directive, BlockedUri, Body)
                    VALUES 
                        (@Age, @RecievedAt, @RecievedAtMin, @RecievedAtHour, @Type, @Url, @UserAgent, @Browser, @Version, @OS, @Directive, @BlockedUri, @Body)
                    """;

            DateTime recievedAtMin = reportTo.RecievedAt.AddSeconds(-reportTo.RecievedAt.Second).AddMilliseconds(-reportTo.RecievedAt.Millisecond);
            DateTime recievedAtHour = recievedAtMin.AddMinutes(-reportTo.RecievedAt.Minute);

            await sqlHelper.ExecuteNonQuery(
                sqlCommand,
                sqlHelper.CreateParameter<int>("Age", DbType.Int32, reportTo.Age),
                sqlHelper.CreateParameter<DateTime>("RecievedAt", DbType.DateTime, reportTo.RecievedAt),
                sqlHelper.CreateParameter<DateTime>("RecievedAtMin", DbType.DateTime, recievedAtMin),
                sqlHelper.CreateParameter<DateTime>("RecievedAtHour", DbType.DateTime, recievedAtHour),
                sqlHelper.CreateParameter<string>("Type", DbType.String, reportTo.Type),
                sqlHelper.CreateParameter<string>("Url", DbType.String, reportTo.Url),
                sqlHelper.CreateParameter<string>("UserAgent", DbType.String, reportTo.UserAgent),
                sqlHelper.CreateParameter<string>("Browser", DbType.String, reportTo.Browser),
                sqlHelper.CreateParameter<string>("Version", DbType.String, reportTo.Version),
                sqlHelper.CreateParameter<string>("OS", DbType.String, reportTo.OS),
                sqlHelper.CreateParameter<string>("Directive", DbType.String, reportTo.Directive),
                sqlHelper.CreateParameter<string>("BlockedUri", DbType.String, reportTo.BlockedUri),
                sqlHelper.CreateParameter<string>("Body", DbType.String, JsonSerializer.Serialize(reportTo.Body)));
        }

        public async Task<DashboardSummary> GetDashboardSummary(DashboardSummary summary)
        {
            var parameters = new List<SqlParameter>
            {
                sqlHelper.CreateParameter("@From", DbType.DateTime, summary.Query.From),
                sqlHelper.CreateParameter("@To", DbType.DateTime, summary.Query.To),
                sqlHelper.CreateParameter("@Type", DbType.String, summary.Query.Type.ToLower()),
                sqlHelper.CreateParameter("@Period", DbType.String, "min")
            };

            await sqlHelper.ExecuteStoredProcedure("GetSecurityReportSummary", parameters, (reader) =>
            {
                return PopulateDashboardSummary(reader, summary);
            });

            return summary;
        }

        public async Task<int> PurgeReporingData(DateTime beforeDate)
        {
            var sqlCommand = "DELETE FROM SecurityReportTo WHERE RecievedAt < @BeforeDate";

            return await sqlHelper.ExecuteNonQuery(
                sqlCommand,
                sqlHelper.CreateParameter<DateTime>("BeforeDate", DbType.DateTime, beforeDate));

        }

        public async Task<CspSearchResults> Search(CspSearchParams searchParams)
        {
            var from = (searchParams.Page - 1) * searchParams.PageSize;

            var sqlCommand = "SecurityReportSearch";
            var parameters = new List<SqlParameter>
            {
                sqlHelper.CreateParameter<int>("@PageSize", DbType.Int32, searchParams.PageSize),
                sqlHelper.CreateParameter<int>("@RecordFrom", DbType.Int32, from),
                sqlHelper.CreateParameter<DateTime>("@DateFrom", DbType.DateTime, searchParams.Filters?.DateFrom ?? DateTime.UtcNow.AddYears(-1)),
                sqlHelper.CreateParameter<string>("@Query", DbType.String, searchParams?.Filters?.Query ?? string.Empty),
                sqlHelper.CreateParameter<string>("@Directive", DbType.String, string.Join(',',searchParams?.Filters?.Directive ?? []) ),
                sqlHelper.CreateParameter<string>("@Browser", DbType.String, string.Join(',',searchParams?.Filters?.Browser ?? [])),
                sqlHelper.CreateParameter<string>("@SortOrder", DbType.String, searchParams?.SortOrder == "ascend" ? "A" : "D"),
                sqlHelper.CreateParameter<int>("@MaxRows", DbType.Int32, 100000)
            };
            var searchResults = new CspSearchResults();

            await sqlHelper.ExecuteStoredProcedure(sqlCommand, parameters, (reader) =>
            {
                return GetCspSearchResults(reader, searchResults);
            });

            return searchResults;
        }

        private static DashboardSummary PopulateDashboardSummary(SqlDataReader reader, DashboardSummary summary)
        {

            summary.TopDirectives.AddRange(GetDashboardIssues(reader, "directive"));

            reader.NextResult();

            summary.TopPages.AddRange(GetDashboardIssues(reader, "page"));

            reader.NextResult();

            summary.Errors.AddRange(GetDashboardGraphItems(reader));

            summary.Total = summary.TopPages?.Sum(x => x.Count) ?? 0;

            return summary;
        }

        private static IEnumerable<DashboardIssue> GetDashboardIssues(SqlDataReader reader, string section)
        {
            var path = Paths.ToResource("Jhoose.Security", "jhoosesecurityadmin#/");

            while (reader.Read())
            {
                yield return new DashboardIssue
                {
                    Name = reader.GetString(0),
                    Url = $"{path}cspissues?{section}={WebUtility.UrlEncode(reader.GetString(0))}",
                    Count = reader.GetInt32(1)
                };
            }
        }

        private static IEnumerable<DashboardGraphItem> GetDashboardGraphItems(SqlDataReader reader)
        {
            while (reader.Read())
            {
                yield return new DashboardGraphItem
                {
                    Time = reader.GetDateTime(2),
                    Metric = reader.GetString(0),
                    Value = reader.GetInt32(3)
                };
            }
        }

        private static CspSearchResults GetCspSearchResults(SqlDataReader reader, CspSearchResults cspSearchResults)
        {

            cspSearchResults.Results.AddRange(GetCspSearchResults1(reader));

            reader.NextResult();

            cspSearchResults.Directives.AddRange(GetDashboardIssues(reader, "directives").Select(i => i.Name));

            reader.NextResult();

            cspSearchResults.Browsers.AddRange(GetDashboardIssues(reader, "browsers").Select(i => i.Name));

            reader.NextResult();

            reader.Read();
            cspSearchResults.Total = reader.GetInt32(0);

            return cspSearchResults;
        }

        private static IEnumerable<CspSearchResult> GetCspSearchResults1(SqlDataReader reader)
        {
            while (reader.Read())
            {
                yield return new CspSearchResult
                {
                    Id = reader.GetInt64(0).ToString(),
                    RecievedAt = reader.GetDateTime(1),
                    Url = reader.GetString(2),
                    Directive = reader.GetString(3),
                    Browser = reader.GetString(4),
                    BlockedUri = reader.GetString(5)
                };
            }
        }
    }
}