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
/// Repository for IP restriction allow-list entries, persisted in their own dedicated table
/// (rather than the shared ResponseHeaders table other list-based features use).
/// </summary>
public class IpRestrictionRepository(
    ILogger<IpRestrictionRepository> logger,
    IConfiguration configuration) : ISecurityRepository<IpRestrictionEntry>
{
    public string CacheKey => Constants.IpRestrictionCacheKey;

    protected virtual string ConnectionString => configuration.GetConnectionString("EPiServerDB") ?? string.Empty;

    public IEnumerable<IpRestrictionEntry> Load()
    {
        try
        {
            var sql = "SELECT Id, Value, Site FROM IpRestrictions";
            using var connection = new SqlConnection(ConnectionString);
            return connection.Query<IpRestrictionEntry>(sql).ToList();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error loading IP restriction entries from database");
            return [];
        }
    }

    public List<IpRestrictionEntry> Load(string headerName) => Load().ToList();

    public IpRestrictionEntry? Save(IpRestrictionEntry header)
    {
        try
        {
            var sql = @"
                MERGE IpRestrictions AS target
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
            logger.LogError(ex, "Error saving IP restriction entry to database");
            return null;
        }
    }

    public bool Save(ResponseHeaderStorage header) =>
        throw new NotSupportedException($"{nameof(IpRestrictionRepository)} does not use {nameof(ResponseHeaderStorage)}; use {nameof(Save)}({nameof(IpRestrictionEntry)}) instead.");

    public bool Delete(IpRestrictionEntry header) => Delete(header.Id);

    public bool Delete(Guid id)
    {
        try
        {
            var sql = "DELETE FROM IpRestrictions WHERE Id = @Id";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, new { Id = id });

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting IP restriction entry from database");
            return false;
        }
    }

    public bool Clear()
    {
        try
        {
            var sql = "DELETE FROM IpRestrictions";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql);

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error clearing IP restriction entries from database");
            return false;
        }
    }

    public bool Clear(string headerName) => Clear();
}
