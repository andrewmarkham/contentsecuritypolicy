using System;

using Jhoose.Security.Features.Core.Cache;
using Jhoose.Security.Features.Settings.Models;
using Dapper;

using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Text.Json;


namespace Jhoose.Security.Features.Settings.Repository;

public class SettingsRepository(
                ICacheManager cache,
                ILogger<SettingsRepository> logger,
                IConfiguration configuration
    ) : ISettingsRepository
{
    private static readonly TimeSpan settingsCacheDuration = TimeSpan.FromHours(1);
    protected virtual string ConnectionString => configuration.GetConnectionString("EPiServerDB") ?? string.Empty;
    public  CspSettings Load()
    {
        var cachedSettings = cache.Get<CspSettings>(Constants.SettingsCacheKey);
        if (cachedSettings is not null)
        {
            return cachedSettings;
        }

        CspSettings? settings = null;

        try
        {
            var sql = "SELECT TOP 1 Value FROM JhooseSecuritySettings";
            using var connection = new SqlConnection(ConnectionString);
            var settingsJson = connection.QuerySingleOrDefault<string>(sql);

            settings = settingsJson is not null
                ? JsonSerializer.Deserialize<CspSettings>(settingsJson) : null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error loading jhoose security settings from database");
        }

        cachedSettings = settings ?? new CspSettings
        {
            Mode = "report",
            PermissionMode = "off",
            ReportingUrl = string.Empty,
            WebhookUrls = [],
            AuthenticationKeys = []
        };

        cache.Insert(Constants.SettingsCacheKey, cachedSettings, settingsCacheDuration);
        return cachedSettings;
    }

    public  bool SaveSettings(CspSettings settings)
    {
        using var connection = new SqlConnection(ConnectionString);

        try
        {   
            connection.Open();

            SqlCommand command = new("UpdateJhooseSecuritySettings", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@value", JsonSerializer.Serialize(settings));
            command.ExecuteNonQuery();
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving settings");
            return false;
        }
        finally
        {
            connection.Close();

            cache.Remove(Constants.SettingsCacheKey);
            cache.Remove(Constants.PolicyCacheKey);
            cache.Remove(Constants.ResponseHeadersCacheKey);
            cache.Remove(Constants.PermissionPolicyCacheKey);
        }
    }
}
