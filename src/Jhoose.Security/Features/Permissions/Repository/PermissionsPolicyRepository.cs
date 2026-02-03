using System;
using System.Collections.Generic;
using System.Text.Json;

using Dapper;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.Data.Models;
using Jhoose.Security.Features.Permissions.Models;

using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Permissions.Repository;

public class PermissionsPolicyRepository(
    ILogger<PermissionsPolicyRepository> logger,
    IConfiguration configuration) : SecurityRepositoryBase<PermissionPolicy>(logger, configuration)
{
    public override string CacheKey => "PermissionsPolicyCacheKey";

    const string PermissionPolicyHeaderName = "Permissions-Policy";
    public override IEnumerable<PermissionPolicy> Load()
    {
        return Load(PermissionPolicyHeaderName) ?? [];
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

    public override bool Clear()
    {
        return Clear(PermissionPolicyHeaderName);
    }
}
