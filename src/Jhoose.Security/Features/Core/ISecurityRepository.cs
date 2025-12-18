using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

using Dapper;

using Jhoose.Security.Configuration;
using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.Data.Models;
using Jhoose.Security.Features.Permissions.Models;
using Jhoose.Security.Features.ResponseHeaders.Models;

using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Core;

public interface ISecurityRepository<T> where T : class
{
    T? Save(T header);
    bool Save(ResponseHeaderStorage header);
    IEnumerable<T> Load();
    IEnumerable<T> Load(string headerName);

    bool Delete(T header);
    bool Clear();
}

public abstract class SecurityRepositoryBase<T>(ILogger logger, IConfiguration configuration) : ISecurityRepository<T> where T : class
{
    protected virtual string ConnectionString => configuration.GetConnectionString("EPiServerDB") ?? string.Empty;
    public abstract IEnumerable<T> Load();
    public virtual IEnumerable<T> Load(string headerName)
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
            yield break;
        }
        
        foreach (var header in headers)
        {
            var responseHeader = JsonSerializer.Deserialize<T>(header.Value);
            if (responseHeader != null)
            {
                yield return responseHeader;
            }
        }
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

    public virtual bool Clear()
    {
        try
        {
            var sql = "DELETE FROM ResponseHeaders";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error clearing response headers from database");
            return false;
        }
    }
}

public class PermissionsPolicyRepository(ILogger<PermissionsPolicyRepository> logger, IConfiguration configuration)
    : SecurityRepositoryBase<PermissionPolicy>(logger, configuration)
{
    const string PermissionPolicyHeaderName = "Permissions-Policy";
    public override IEnumerable<PermissionPolicy> Load()
    {
        return Load(PermissionPolicyHeaderName);
    }
    public override PermissionPolicy? Save(PermissionPolicy header)
    {
        var storage = new ResponseHeaderStorage(header.Id, PermissionPolicyHeaderName, header.Key, JsonSerializer.Serialize(header));

        return Save(storage) ? header : null;
    }

    public override bool Save(ResponseHeaderStorage header)
    {
        try
        {
            var sql = @"
                MERGE ResponseHeaders AS target
                USING (SELECT @Id AS Id, @Name AS Name, @Directive AS Directive, @Value AS Value) AS source
                ON target.Directive = source.Directive
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

    public override bool Delete(PermissionPolicy header)
    {
        try
        {
            var sql = "DELETE FROM ResponseHeaders WHERE Directive = @Directive";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, new { Directive = header.Key });
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting response header from database");
            return false;
        }
    }
}


public class ResponseHeaderRepository(ILogger<ResponseHeaderRepository> logger, IConfiguration configuration) : SecurityRepositoryBase<ResponseHeader>(logger, configuration)
{
    const string HeaderName = "Response-Policy";
    public override IEnumerable<ResponseHeader> Load()
    {
        var headers = Load(HeaderName) ?? [];

        if (!headers.Any())
        {
            var defaultOptions = new JhooseSecurityOptions();
            foreach (var p in defaultOptions.Headers)
            {
                Save(p);
            }

            headers = Load(HeaderName);
        }

        return headers;
    }

    public override ResponseHeader? Save(ResponseHeader header)
    {
        var storage = new ResponseHeaderStorage(header.Id, HeaderName, header.Name, JsonSerializer.Serialize(header));

        return Save(storage) ? header : null;
    }

    public override bool Delete(ResponseHeader header)
    {
        try
        {
            var sql = "DELETE FROM ResponseHeaders WHERE Id = @Id";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, new { Id = header.Id });
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting response header from database");
            return false;
        }
    }
}

public class ContentSecurityPolicyRepository(ILogger<ContentSecurityPolicyRepository> logger, IConfiguration configuration) : SecurityRepositoryBase<CspPolicy>(logger, configuration)
{
    const string HeaderName = "Content-Security-Policy";
    public override IEnumerable<CspPolicy> Load()
    {
        var headers = Load(HeaderName) ?? [];

        return headers;
    }

    public override CspPolicy? Save(CspPolicy header)
    {
        var storage = new ResponseHeaderStorage(header.Id, HeaderName, header.PolicyName, JsonSerializer.Serialize(header));

        return Save(storage) ? header : null;
    }

    public override bool Delete(CspPolicy header)
    {
        try
        {
            var sql = "DELETE FROM ResponseHeaders WHERE Id = @Id";
            using var connection = new SqlConnection(ConnectionString);
            connection.Execute(sql, new { Id = header.Id });
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting response header from database");
            return false;
        }
    }
}
