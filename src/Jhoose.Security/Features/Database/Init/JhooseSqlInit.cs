using System.Threading;
using System.Threading.Tasks;

using Jhoose.Security.Features.Database;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Reporting.Database;

public class JhooseSqlInit(ILogger<JhooseSqlInit> logger, ISqlHelper isqlHelper) : IHostedService
{
    protected const string DBVersion = "3.3.0";

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
                await CreateStoredProcedure();

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

            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='JhooseSecuritySettings' AND xtype='U')
            BEGIN
                CREATE TABLE JhooseSecuritySettings (
                    Id              INT NOT NULL
                                    CONSTRAINT PK_AppSettings PRIMARY KEY
                                    CONSTRAINT CK_AppSettings_SingleRow CHECK (Id = 1),
                    Value           NVARCHAR(max)
                )
            END

            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='IpRestrictions' AND xtype='U')
            BEGIN
                CREATE TABLE IpRestrictions (
                    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    Value           NVARCHAR(100) NOT NULL,
                    Site            NVARCHAR(50) NOT NULL DEFAULT '*'
                )
            END

            IF (INDEXPROPERTY(OBJECT_ID('IpRestrictions'), 'IDX_IpRestrictions_Site', 'IndexID') IS NULL)
                CREATE NONCLUSTERED INDEX IDX_IpRestrictions_Site ON IpRestrictions (Site)

            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='IpRestrictionIgnoredPaths' AND xtype='U')
            BEGIN
                CREATE TABLE IpRestrictionIgnoredPaths (
                    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    Value           NVARCHAR(256) NOT NULL,
                    Site            NVARCHAR(50) NOT NULL DEFAULT '*'
                )
            END

            IF (INDEXPROPERTY(OBJECT_ID('IpRestrictionIgnoredPaths'), 'IDX_IpRestrictionIgnoredPaths_Site', 'IndexID') IS NULL)
                CREATE NONCLUSTERED INDEX IDX_IpRestrictionIgnoredPaths_Site ON IpRestrictionIgnoredPaths (Site)

            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='IpRestrictionIgnoreHeaders' AND xtype='U')
            BEGIN
                CREATE TABLE IpRestrictionIgnoreHeaders (
                    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    HeaderName      NVARCHAR(100) NOT NULL,
                    HeaderValue     NVARCHAR(256) NOT NULL,
                    Site            NVARCHAR(50) NOT NULL DEFAULT '*'
                )
            END

            IF (INDEXPROPERTY(OBJECT_ID('IpRestrictionIgnoreHeaders'), 'IDX_IpRestrictionIgnoreHeaders_Site', 'IndexID') IS NULL)
                CREATE NONCLUSTERED INDEX IDX_IpRestrictionIgnoreHeaders_Site ON IpRestrictionIgnoreHeaders (Site)

        """;

        await isqlHelper.ExecuteNonQuery(sqlCommand);
    }

    private async Task CreateStoredProcedure()
    {
        var sqlCommand = """
            CREATE OR ALTER PROCEDURE UpdateJhooseSecuritySettings(@Value AS NVARCHAR(max)) AS
            BEGIN
                UPDATE JhooseSecuritySettings
                SET
                    Value = @Value
                WHERE Id = 1;

                IF @@ROWCOUNT = 0
                BEGIN
                    INSERT INTO JhooseSecuritySettings (Id, Value)
                    VALUES (1, @Value);
                END
            END
            """;
        await isqlHelper.ExecuteNonQuery(sqlCommand);
    }
}