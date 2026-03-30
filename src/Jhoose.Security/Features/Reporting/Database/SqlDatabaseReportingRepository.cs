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

public class SqlDatabaseReportingRepository(ILogger<SqlDatabaseReportingRepository> logger, ISqlHelper sqlHelper) : IReportingRepository
{
    public string Type => "Sql";

    public async Task AddReport(ReportTo<IReportToBody> reportTo)
    {
        try {
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
                sqlHelper.CreateParameter<string>("Type", SqlDbType.NVarChar, reportTo.Type[..30]),
                sqlHelper.CreateParameter<string>("Url", SqlDbType.NVarChar, reportTo.Url[..512]),
                sqlHelper.CreateParameter<string>("UserAgent", SqlDbType.NVarChar, reportTo.UserAgent[..512]),
                sqlHelper.CreateParameter<string>("Browser", SqlDbType.NVarChar, reportTo?.Browser?[..20] ?? string.Empty),
                sqlHelper.CreateParameter<string>("Version", SqlDbType.NVarChar, reportTo?.Version?[..20] ?? string.Empty),
                sqlHelper.CreateParameter<string>("OS", SqlDbType.NVarChar, reportTo?.OS?[..20] ?? string.Empty),
                sqlHelper.CreateParameter<string>("Directive", SqlDbType.NVarChar, reportTo?.Directive?[..20] ?? string.Empty),
                sqlHelper.CreateParameter<string>("BlockedUri", SqlDbType.NVarChar, reportTo?.Message?[..1024] ?? string.Empty),
                sqlHelper.CreateParameter<string>("Body", SqlDbType.NVarChar, JsonSerializer.Serialize(reportTo?.Body)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Insert of report to failed");
            throw;
        }
    }

    public async Task AddReports(IEnumerable<ReportTo<IReportToBody>> reportTos)
    {
        try {
            await sqlHelper.ExecuteStoredProcedure<IEnumerable<SqlDataRecord>>(
                "InsertSecurityReportTo",
                [
                    sqlHelper.CreateParameter("ReportTos", SqlDbType.Structured, CreateReportToRecords(reportTos))
                ]);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Bulk insert of report tos failed");
            throw;
        }
    }

    public async Task<DashboardSummary> GetDashboardSummary(DashboardSummary summary)
    {
        try {
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
        catch (Exception ex)
        {
            logger.LogError(ex, "Get dashboard summary failed");
            throw;
        }
    }

    public async Task<int> PurgeReporingData(DateTime beforeDate)
    {
        try {
            var sqlCommand = "DELETE FROM SecurityReportTo WHERE RecievedAt < @BeforeDate";

            return await sqlHelper.ExecuteNonQuery(
                sqlCommand,
                sqlHelper.CreateParameter<DateTime>("BeforeDate", SqlDbType.DateTime, beforeDate));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Purge reporting data failed");
            throw;
        }

    }

    public async Task<CspSearchResults> Search(CspSearchParams searchParams)
    {
        try {
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
        catch (Exception ex)
        {
            logger.LogError(ex, "Search reporting data failed");
            throw;
        }
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
        new SqlMetaData("Type", SqlDbType.NVarChar, 30),
        new SqlMetaData("Url", SqlDbType.NVarChar, 512),
        new SqlMetaData("UserAgent", SqlDbType.NVarChar, 512),
        new SqlMetaData("Browser", SqlDbType.NVarChar, 20),
        new SqlMetaData("Version", SqlDbType.NVarChar, 20),
        new SqlMetaData("OS", SqlDbType.NVarChar, 20),
        new SqlMetaData("Directive", SqlDbType.NVarChar, 20),
        new SqlMetaData("BlockedUri", SqlDbType.NVarChar, 1024),
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
        record.SetString(4, c.Type[..30]);
        record.SetString(5, c.Url[..512]);
        record.SetString(6, c.UserAgent[..512]);
        record.SetString(7, c.Browser?[..20]);
        record.SetString(8, c.Version?[..20]);
        record.SetString(9, c.OS?[..20]);
        record.SetString(10, c.Directive?[..20]);
        record.SetString(11, c.Message?[..1024] ?? string.Empty);
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