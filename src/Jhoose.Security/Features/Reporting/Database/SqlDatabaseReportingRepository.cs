using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

using EPiServer.Shell;

using Jhoose.Security.Features.Database;
using Jhoose.Security.Features.Reporting.Models;
using Jhoose.Security.Features.Reporting.Models.Dashboard;
using Jhoose.Security.Features.Reporting.Models.Search;

using Microsoft.Data.SqlClient;
using Microsoft.Data.SqlClient.Server;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Reporting.Database;

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

    public async Task AddReport(ReportTo<IReportToBody> reportTo)
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
            sqlHelper.CreateParameter<int>("Age", SqlDbType.Int, reportTo.Age),
            sqlHelper.CreateParameter<DateTime>("RecievedAt", SqlDbType.DateTime, reportTo.RecievedAt),
            sqlHelper.CreateParameter<DateTime>("RecievedAtMin", SqlDbType.DateTime, recievedAtMin),
            sqlHelper.CreateParameter<DateTime>("RecievedAtHour", SqlDbType.DateTime, recievedAtHour),
            sqlHelper.CreateParameter<string>("Type", SqlDbType.NVarChar, reportTo.Type),
            sqlHelper.CreateParameter<string>("Url", SqlDbType.NVarChar, reportTo.Url),
            sqlHelper.CreateParameter<string>("UserAgent", SqlDbType.NVarChar, reportTo.UserAgent),
            sqlHelper.CreateParameter<string>("Browser", SqlDbType.NVarChar, reportTo.Browser),
            sqlHelper.CreateParameter<string>("Version", SqlDbType.NVarChar, reportTo.Version),
            sqlHelper.CreateParameter<string>("OS", SqlDbType.NVarChar, reportTo.OS),
            sqlHelper.CreateParameter<string>("Directive", SqlDbType.NVarChar, reportTo.Directive),
            sqlHelper.CreateParameter<string>("BlockedUri", SqlDbType.NVarChar, reportTo.Message ?? string.Empty),
            sqlHelper.CreateParameter<string>("Body", SqlDbType.NVarChar, JsonSerializer.Serialize(reportTo.Body)));
    }

    public async Task AddReports(IEnumerable<ReportTo<IReportToBody>> reportTos)
    {
        await sqlHelper.ExecuteStoredProcedure<IEnumerable<SqlDataRecord>>(
            "InsertSecurityReportTo",
            new List<SqlParameter>
            {
                sqlHelper.CreateParameter("ReportTos", SqlDbType.Structured, CreateReportToRecords(reportTos))
            });
    }

    public async Task<DashboardSummary> GetDashboardSummary(DashboardSummary summary)
    {
        var parameters = new List<SqlParameter>
        {
            sqlHelper.CreateParameter("@From", SqlDbType.DateTime, summary.Query.From),
            sqlHelper.CreateParameter("@To", SqlDbType.DateTime, summary.Query.To),
            sqlHelper.CreateParameter("@Type", SqlDbType.NVarChar, summary.Query.Type.ToLower()),
            sqlHelper.CreateParameter("@Period", SqlDbType.NVarChar, "min")
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
            sqlHelper.CreateParameter<DateTime>("BeforeDate", SqlDbType.DateTime, beforeDate));

    }

    public async Task<CspSearchResults> Search(CspSearchParams searchParams)
    {
        var from = (searchParams.Page - 1) * searchParams.PageSize;

        var sqlCommand = "SecurityReportSearch";
        var parameters = new List<SqlParameter>
        {
            sqlHelper.CreateParameter<int>("@PageSize", SqlDbType.Int, searchParams.PageSize),
            sqlHelper.CreateParameter<int>("@RecordFrom", SqlDbType.Int, from),
            sqlHelper.CreateParameter<DateTime>("@DateFrom", SqlDbType.DateTime, searchParams.Filters?.DateFrom ?? DateTime.UtcNow.AddYears(-1)),
            sqlHelper.CreateParameter<string>("@Query", SqlDbType.NVarChar, searchParams?.Filters?.Query ?? string.Empty),
            sqlHelper.CreateParameter<string>("@Directive", SqlDbType.NVarChar, string.Join(',',searchParams?.Filters?.Directive ?? []) ),
            sqlHelper.CreateParameter<string>("@Browser", SqlDbType.NVarChar, string.Join(',',searchParams?.Filters?.Browser ?? [])),
            sqlHelper.CreateParameter<string>("@Type", SqlDbType.NVarChar, string.Join(',',searchParams?.Filters?.Type ?? [])),
            sqlHelper.CreateParameter<string>("@SortOrder", SqlDbType.NVarChar, searchParams?.SortOrder == "ascend" ? "A" : "D"),
            sqlHelper.CreateParameter<int>("@MaxRows", SqlDbType.Int, 100000)
        };
        var searchResults = new CspSearchResults();

        await sqlHelper.ExecuteStoredProcedure(sqlCommand, parameters, (reader) =>
        {
            return GetCspSearchResults(reader, searchResults);
        });

        return searchResults;
    }

private static IEnumerable<SqlDataRecord> CreateReportToRecords(
    IEnumerable<ReportTo<IReportToBody>> reportTos)
{
    var metaData = new[]
    {
        new SqlMetaData("Age", SqlDbType.Int),
        new SqlMetaData("RecievedAt", SqlDbType.DateTime),
        new SqlMetaData("RecievedAtMin", SqlDbType.DateTime),
        new SqlMetaData("RecievedAtHour", SqlDbType.DateTime),
        new SqlMetaData("Type", SqlDbType.NVarChar, 200),
        new SqlMetaData("Url", SqlDbType.NVarChar, 2000),
        new SqlMetaData("UserAgent", SqlDbType.NVarChar, 1000),
        new SqlMetaData("Browser", SqlDbType.NVarChar, 200),
        new SqlMetaData("Version", SqlDbType.NVarChar, 100),
        new SqlMetaData("OS", SqlDbType.NVarChar, 200),
        new SqlMetaData("Directive", SqlDbType.NVarChar, 500),
        new SqlMetaData("BlockedUri", SqlDbType.NVarChar, 2000),
        new SqlMetaData("Body", SqlDbType.NVarChar, -1)
    };

    var record = new SqlDataRecord(metaData);

    foreach (var c in reportTos)
    {

        DateTime recievedAtMin = c.RecievedAt.AddSeconds(-c.RecievedAt.Second).AddMilliseconds(-c.RecievedAt.Millisecond);
        DateTime recievedAtHour = recievedAtMin.AddMinutes(-c.RecievedAt.Minute);

        record.SetInt32(0, c.Age);
        record.SetDateTime(1, c.RecievedAt);
        record.SetDateTime(2, recievedAtMin);
        record.SetDateTime(3, recievedAtHour);
        record.SetString(4, c.Type);
        record.SetString(5, c.Url);
        record.SetString(6, c.UserAgent);
        record.SetString(7, c.Browser);
        record.SetString(8, c.Version);
        record.SetString(9, c.OS);
        record.SetString(10, c.Directive);
        record.SetString(11, c.Message ?? string.Empty);
        record.SetString(12, JsonSerializer.Serialize(c.Body));

        yield return record;
    }
}
    private static DashboardSummary PopulateDashboardSummary(SqlDataReader reader, DashboardSummary summary)
    {

        summary.TopDirectives.AddRange(GetDashboardIssues(reader, "directive"));

        reader.NextResult();

        summary.TopPages.AddRange(GetDashboardIssues(reader, "page"));

        reader.NextResult();

        summary.TopTypes.AddRange(GetDashboardIssues(reader, "type"));

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

        cspSearchResults.Types.AddRange(GetDashboardIssues(reader, "types").Select(i => i.Name));

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
                BlockedUri = reader.GetString(5),
                Type = reader.GetString(6)
            };
        }
    }
}