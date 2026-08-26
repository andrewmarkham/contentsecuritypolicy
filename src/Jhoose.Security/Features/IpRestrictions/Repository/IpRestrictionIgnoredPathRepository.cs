using System;
using System.Collections.Generic;
using System.Linq;

using Dapper;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.Data.Models;
using Jhoose.Security.Features.IpRestrictions.Models;

using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.IpRestrictions.Repository;

/// <summary>
/// Repository for IP restriction ignored-path entries, persisted in their own dedicated table
/// (rather than the shared ResponseHeaders table other list-based features use).
/// </summary>
public class IpRestrictionIgnoredPathRepository(
    ILogger<IpRestrictionIgnoredPathRepository> logger,
    IConfiguration configuration) : ISecurityRepository<IpRestrictionIgnoredPath>
{
    public string CacheKey => Constants.IpRestrictionIgnoredPathCacheKey;

    protected virtual string ConnectionString => configuration.GetConnectionString("EPiServerDB") ?? string.Empty;

    public IEnumerable<IpRestrictionIgnoredPath> Load()
    {
        try
        {
            var sql = "SELECT Id, Value, Site FROM IpRestrictionIgnoredPaths";
            using var connection = new SqlConnection(ConnectionString);
            return connection.Query<IpRestrictionIgnoredPath>(sql).ToList();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error loading IP restriction ignored paths from database");
            return [];
        }
    }

    public List<IpRestrictionIgnoredPath> Load(string headerName) => Load().ToList();

    public IpRestrictionIgnoredPath? Save(IpRestrictionIgnoredPath header)
    {
        try
        {
            var sql = @"
                MERGE IpRestrictionIgnoredPaths AS target
                USING (SELECT @Id AS Id, @Value AS Value, @Site AS Site) AS source
                ON target.Id = source.Id
                WHEN MATCHED THEN
                    UPDATE SET Value = source.Value, Site = source.Site
                WHEN NOT MATCHED THEN
                    INSERT (Id, Value, Site) VALUES (source.Id, source.Value, source.Site);";

            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, header);

            return header;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving IP restriction ignored path to database");
            return null;
        }
    }

    public bool Save(ResponseHeaderStorage header) =>
        throw new NotSupportedException($"{nameof(IpRestrictionIgnoredPathRepository)} does not use {nameof(ResponseHeaderStorage)}; use {nameof(Save)}({nameof(IpRestrictionIgnoredPath)}) instead.");

    public bool Delete(IpRestrictionIgnoredPath header) => Delete(header.Id);

    public bool Delete(Guid id)
    {
        try
        {
            var sql = "DELETE FROM IpRestrictionIgnoredPaths WHERE Id = @Id";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, new { Id = id });

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting IP restriction ignored path from database");
            return false;
        }
    }

    public bool Clear()
    {
        try
        {
            var sql = "DELETE FROM IpRestrictionIgnoredPaths";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql);

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error clearing IP restriction ignored paths from database");
            return false;
        }
    }

    public bool Clear(string headerName) => Clear();
}
