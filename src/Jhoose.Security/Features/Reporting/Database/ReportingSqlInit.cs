using System.Threading.Tasks;

using Jhoose.Security.Features.Database;

namespace Jhoose.Security.Features.Reporting.Database;

public class ReportingSqlInit
{
    internal static async Task CreateUpdateTable(ISqlHelper isqlHelper)
    {
        var sqlCommand = """
            IF EXISTS (SELECT * FROM sysobjects WHERE name='SecurityReportToVersion' AND xtype='U')
            BEGIN
                DROP TABLE SecurityReportToVersion
            END
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SecurityReportTo' AND xtype='U')
            BEGIN
                CREATE TABLE SecurityReportTo (
                    Id              BIGINT PRIMARY KEY IDENTITY,
                    Age             INT,
                    RecievedAt      DATETIME,
                    RecievedAtMin   DATETIME,
                    RecievedAtHour  DATETIME,
                    Type            NVARCHAR(30),
                    Url             NVARCHAR(512),
                    UserAgent       NVARCHAR(512),
                    
                    Browser         NVARCHAR(20),
                    Version         NVARCHAR(20),
                    OS              NVARCHAR(20),

                    Directive       NVARCHAR(20),
                    BlockedUri      NVARCHAR(1024),
                    Body            NVARCHAR(max)
                )
            END
            
            IF (INDEXPROPERTY(OBJECT_ID('SecurityReportTo'), 'IDX_RecievedAt', 'IndexID') IS NULL)
                CREATE NONCLUSTERED INDEX IDX_RecievedAt ON SecurityReportTo (RecievedAt)

            IF (INDEXPROPERTY(OBJECT_ID('SecurityReportTo'), 'IDX_RecievedAtMin', 'IndexID') IS NULL)
                CREATE NONCLUSTERED INDEX IDX_RecievedAtMin ON SecurityReportTo (RecievedAtMin)
            

            IF (INDEXPROPERTY(OBJECT_ID('SecurityReportTo'), 'IDX_Url', 'IndexID') IS NULL)
                CREATE NONCLUSTERED INDEX IDX_Url ON SecurityReportTo (Url)
            
            IF (INDEXPROPERTY(OBJECT_ID('SecurityReportTo'), 'IDX_Browser', 'IndexID') IS NULL)
                CREATE NONCLUSTERED INDEX IDX_Browser ON SecurityReportTo (Browser)
            
            IF (INDEXPROPERTY(OBJECT_ID('SecurityReportTo'), 'IDX_Directive', 'IndexID') IS NULL)
                CREATE NONCLUSTERED INDEX IDX_Directive ON SecurityReportTo (Directive)

        """;

        await isqlHelper.ExecuteNonQuery(sqlCommand);
    }

    internal static async Task CreateStoredProcedure(ISqlHelper isqlHelper)
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