using System.Threading;
using System.Threading.Tasks;

using Jhoose.Security.Features.Database;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Reporting.Database;

public class JhooseSqlInit(ILogger<JhooseSqlInit> logger, ISqlHelper isqlHelper) : IHostedService
{
    protected const string DBVersion = "3.0.0";

    private readonly ILogger<JhooseSqlInit> logger = logger;
    private readonly ISqlHelper isqlHelper = isqlHelper;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        return Task.Run(async () =>
        {
            var currentDBVersion = await GetCurrentVersion();
            if (currentDBVersion != DBVersion)
            {
                await ReportingSqlInit.CreateUpdateTable(isqlHelper);
                await ReportingSqlInit.CreateStoredProcedure(isqlHelper);

                await CreateUpdateTable();
                //await CreateStoredProcedure();

                await SetCurrentVersion(DBVersion);
            }

        }, cancellationToken);
    }


    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;


    private async Task<bool> JhooseVersionExists()
    {
        var sqlCommand = """
            IF (EXISTS (SELECT * 
              FROM INFORMATION_SCHEMA.TABLES 
             WHERE TABLE_NAME = 'JhooseVersion'))
            BEGIN
                SELECT 1
            END
            ELSE
            BEGIN
                SELECT 0
            END
            """;

        var result = await isqlHelper.ExecuteScalar<int>(sqlCommand);
        return result > 0;
    }

    

    private async Task<string> GetCurrentVersion()
    {
        string version = string.Empty;

        if (!await JhooseVersionExists())
        {
            return version;
        }

        var sqlCommand = "SELECT Version FROM JhooseVersion";
        await isqlHelper.ExecuteReader(sqlCommand, [], readerAction: reader =>
        {
            if (reader.Read())
            {
                version = reader.GetString(0);
            }

            return version;
        });

        return version;
    }


    private async Task SetCurrentVersion(string version)
    {
        await isqlHelper.ExecuteNonQuery("DELETE FROM JhooseVersion");
        await isqlHelper.ExecuteNonQuery($"INSERT INTO JhooseVersion VALUES ('{version}')");
    }

    private async Task CreateUpdateTable()
    {
        var sqlCommand = """
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='JhooseVersion' AND xtype='U')
            BEGIN
                CREATE TABLE JhooseVersion (
                    Version NVARCHAR(20)
                )
            END

            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ResponseHeaders' AND xtype='U')
            BEGIN
                CREATE TABLE ResponseHeaders (
                    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    Name            NVARCHAR(50),
                    Directive       NVARCHAR(50),
                    Value           NVARCHAR(max)
                )
            END
            
            IF (INDEXPROPERTY(OBJECT_ID('ResponseHeaders'), 'IDX_HeaderAndDirective', 'IndexID') IS NULL)
                CREATE NONCLUSTERED INDEX IDX_HeaderAndDirective ON ResponseHeaders (Name, Directive)            
        """;

        await isqlHelper.ExecuteNonQuery(sqlCommand);
    }

    private async Task CreateStoredProcedure()
    {
        var sqlCommand = """
            CREATE OR ALTER PROCEDURE GetSecurityReportSummary(@From AS DATETIME,@To AS DATETIME, @Type AS CHAR(10), @Period AS CHAR(5)) AS 
            BEGIN

                DECLARE @MinDate AS DATETIME
                SET @MinDate = (SELECT MIN(RecievedAtMin) FROM SecurityReportTo WHERE RecievedAtMin BETWEEN @From AND @To)

                SELECT  id, 
                        RecievedAt,
                        RecievedAtMin,
                        RecievedAtHour,
                        CASE @Period
                            WHEN 'min' THEN DATEDIFF(MINUTE,@MinDate, RecievedAtMin)
                            WHEN 'hour' THEN DATEDIFF(HOUR,@MinDate, RecievedAtHour)
                        END AS DistanceFromStart,
                        Url, 
                        Browser, 
                        Directive, 
                        Type,
                        CASE @Type
                            WHEN 'directive' THEN Directive
                            WHEN 'browser' THEN Browser 
                            WHEN 'page' THEN url
                            WHEN 'type' THEN Type
                        END AS Metric
                INTO #TempReportData
                FROM SecurityReportTo
                WHERE RecievedAtMin BETWEEN @From AND @To

                SELECT TOP 5 
                    Directive,
                    COUNT(*)
                FROM #TempReportData
                GROUP BY Directive
                ORDER BY COUNT(*) DESC

                SELECT TOP 5
                    Url,
                    COUNT(*)
                FROM #TempReportData
                GROUP BY Url
                ORDER BY COUNT(*) DESC

                SELECT TOP 5
                    Type,
                    COUNT(*)
                FROM #TempReportData
                GROUP BY Type
                ORDER BY COUNT(*) DESC

                SELECT 
                    Metric,
                    DistanceFromStart,
                    MIN(CASE @Period
                        WHEN 'min' THEN RecievedAtMin
                        WHEN 'hour' THEN RecievedAtHour
                    END) AS RecievedAt,
                    COUNT(*)
                FROM #TempReportData
                GROUP BY DistanceFromStart, Metric
                ORDER BY DistanceFromStart ASC

            END

        """;

        await isqlHelper.ExecuteNonQuery(sqlCommand);

        sqlCommand = """
                CREATE OR ALTER PROCEDURE SecurityReportSearch(
                    @PageSize AS INTEGER,
                    @RecordFrom AS INTEGER,
                    @DateFrom AS DATETIME,
                    @Query AS CHAR(1024),
                    @Directive AS CHAR(1024),
                    @Browser AS CHAR(1024),
                    @Type AS CHAR(1024),
                    @SortOrder AS CHAR(1) = 'D',
                    @MaxRows AS INTEGER = 100000) AS 
            BEGIN

                --filter results with predicates
                SELECT TOP(@MaxRows)
                        ROW_NUMBER() OVER( ORDER BY Id) AS RowNumber,
                        Id,
                        RecievedAt,
                        Url,
                        Directive,
                        Browser,
                        BlockedUri,
                        Type
                INTO #TempSearchData
                FROM SecurityReportTo
                WHERE RecievedAtMin >= @DateFrom AND 
                        (@Query = '' OR Url LIKE '%' + TRIM(@Query) + '%' OR BlockedUri LIKE '%' + TRIM(@Query) + '%') AND
                        (@Browser = '' OR Browser IN (SELECT value FROM string_split(@Browser, ','))) AND
                        (@Directive = '' OR Directive IN (SELECT value FROM string_split(@Directive, ','))) AND
                        (@Type = '' OR Type IN (SELECT value FROM string_split(@Type, ',')))
                ORDER BY 
                    CASE WHEN @SortOrder = 'D' THEN RecievedAt ELSE '' END DESC,
                    CASE WHEN @SortOrder = 'A' THEN RecievedAt ELSE '' END ASC

                --Get results
                SELECT 
                    Id,
                    RecievedAt,
                    Url,
                    Directive,
                    Browser,
                    BlockedUri,
                    Type
                FROM #TempSearchData
                ORDER BY 
                    CASE WHEN @SortOrder = 'D' THEN RowNumber ELSE '' END DESC,
                    CASE WHEN @SortOrder = 'A' THEN RowNumber ELSE '' END ASC
                OFFSET @RecordFrom ROWS
                FETCH NEXT @PageSize ROWS ONLY
                    
                SELECT TOP 15 
                    Directive,
                    COUNT(*)
                FROM #TempSearchData
                GROUP BY Directive
                ORDER BY COUNT(*) DESC

                SELECT TOP 15
                    Browser,
                    COUNT(*)
                FROM #TempSearchData
                GROUP BY Browser
                ORDER BY COUNT(*) DESC

                SELECT TOP 15
                    Type,
                    COUNT(*)
                FROM #TempSearchData
                GROUP BY Type
                ORDER BY COUNT(*) DESC


                SELECT 
                    COUNT(*) AS Total 
                FROM #TempSearchData

            END
            """;
        await isqlHelper.ExecuteNonQuery(sqlCommand);
    }
}