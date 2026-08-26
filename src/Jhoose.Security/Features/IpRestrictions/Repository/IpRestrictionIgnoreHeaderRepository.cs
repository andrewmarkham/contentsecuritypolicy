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
/// Repository for IP restriction ignore-header entries, persisted in their own dedicated table
/// (rather than the shared ResponseHeaders table other list-based features use).
/// </summary>
public class IpRestrictionIgnoreHeaderRepository(
    ILogger<IpRestrictionIgnoreHeaderRepository> logger,
    IConfiguration configuration) : ISecurityRepository<IpRestrictionIgnoreHeader>
{
    public string CacheKey => Constants.IgnoreHeadersCacheKey;

    protected virtual string ConnectionString => configuration.GetConnectionString("EPiServerDB") ?? string.Empty;

    public IEnumerable<IpRestrictionIgnoreHeader> Load()
    {
        try
        {
            var sql = "SELECT Id, HeaderName, HeaderValue, Site FROM IpRestrictionIgnoreHeaders";
            using var connection = new SqlConnection(ConnectionString);
            return connection.Query<IpRestrictionIgnoreHeader>(sql).ToList();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error loading IP restriction ignore headers from database");
            return [];
        }
    }

    public List<IpRestrictionIgnoreHeader> Load(string headerName) => Load().ToList();

    public IpRestrictionIgnoreHeader? Save(IpRestrictionIgnoreHeader header)
    {
        try
        {
            var sql = @"
                MERGE IpRestrictionIgnoreHeaders AS target
                USING (SELECT @Id AS Id, @HeaderName AS HeaderName, @HeaderValue AS HeaderValue, @Site AS Site) AS source
                ON target.Id = source.Id
                WHEN MATCHED THEN
                    UPDATE SET HeaderName = source.HeaderName, HeaderValue = source.HeaderValue, Site = source.Site
                WHEN NOT MATCHED THEN
                    INSERT (Id, HeaderName, HeaderValue, Site) VALUES (source.Id, source.HeaderName, source.HeaderValue, source.Site);";

            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, header);

            return header;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving IP restriction ignore header to database");
            return null;
        }
    }

    public bool Save(ResponseHeaderStorage header) =>
        throw new NotSupportedException($"{nameof(IpRestrictionIgnoreHeaderRepository)} does not use {nameof(ResponseHeaderStorage)}; use {nameof(Save)}({nameof(IpRestrictionIgnoreHeader)}) instead.");

    public bool Delete(IpRestrictionIgnoreHeader header) => Delete(header.Id);

    public bool Delete(Guid id)
    {
        try
        {
            var sql = "DELETE FROM IpRestrictionIgnoreHeaders WHERE Id = @Id";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, new { Id = id });

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting IP restriction ignore header from database");
            return false;
        }
    }

    public bool Clear()
    {
        try
        {
            var sql = "DELETE FROM IpRestrictionIgnoreHeaders";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql);

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error clearing IP restriction ignore headers from database");
            return false;
        }
    }

    public bool Clear(string headerName) => Clear();
}
