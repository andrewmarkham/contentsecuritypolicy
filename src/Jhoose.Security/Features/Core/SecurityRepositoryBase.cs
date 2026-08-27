using System;
using System.Collections.Generic;
using System.Text.Json;

using Dapper;

using Jhoose.Security.Features.Data.Models;

using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Core;

public abstract class SecurityRepositoryBase<T>(ILogger logger, IConfiguration configuration) : ISecurityRepository<T> where T : class
{
    public abstract string CacheKey { get; }

    protected virtual string ConnectionString => configuration.GetConnectionString("EPiServerDB") ?? string.Empty;
    public abstract IEnumerable<T> Load();
    public virtual List<T> Load(string headerName)
    {
        IEnumerable<ResponseHeaderStorage> headers;
        try
        {
            var sql = "SELECT * FROM ResponseHeaders WHERE Name = @headerName";
            using var connection = new SqlConnection(ConnectionString);
            headers = connection.Query<ResponseHeaderStorage>(sql, new { headerName = headerName });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error loading response headers from database");
            return [];
        }
        
        var headerList = new List<T>();

        try {
            foreach (var header in headers)
            {
                var responseHeader = JsonSerializer.Deserialize<T>(header.Value);
                if (responseHeader != null)
                {
                    headerList.Add(responseHeader);
                }
            }
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Error deserializing response header from database");
        }

        return headerList;
    }

    public abstract T? Save(T header);
    public virtual bool Save(ResponseHeaderStorage header)
    {
        try
        {
            var sql = @"
                MERGE ResponseHeaders AS target
                USING (SELECT @Id AS Id, @Name AS Name, @Directive AS Directive, @Value AS Value) AS source
                ON target.Id = source.Id
                WHEN MATCHED THEN
                    UPDATE SET Name = source.Name, Directive = source.Directive, Value = source.Value
                WHEN NOT MATCHED THEN
                    INSERT (Id, Name, Directive, Value) VALUES (source.Id, source.Name, source.Directive, source.Value);";

            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, header);

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving response header to database");
            return false;
        }
    }

    public abstract bool Delete(T header);

    public virtual bool Delete(Guid id)
    {
        try
        {
            var sql = "DELETE FROM ResponseHeaders WHERE Id = @Id";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, new { Id = id });

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting response header from database");
            return false;
        }
    }

    public abstract bool Clear();

    public virtual bool Clear(string headerName)
    {
        try
        {
            var sql = "DELETE FROM ResponseHeaders WHERE Name = @headerName";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, new { headerName });
            
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error clearing response headers from database");
            return false;
        }
    }
}
