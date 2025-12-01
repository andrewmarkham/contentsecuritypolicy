using System.Collections.Generic;
using System.Linq;

using EPiServer.Data;
using EPiServer.Data.Dynamic;

using Jhoose.Security.Core;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Models.Permissions;
using Jhoose.Security.Core.Repository;

using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Repository;

public class StandardPermissionsRepository : IPermissionsRepository
{
    protected readonly DynamicDataStoreFactory dataStoreFactory;
    protected readonly ICacheManager cache;

    private readonly IDatabaseMode databaseMode;
    private readonly IHttpContextAccessor httpContextAccessor;

    public StandardPermissionsRepository(DynamicDataStoreFactory dataStoreFactory,
        ICacheManager cache,
        IDatabaseMode databaseMode,
        IHttpContextAccessor httpContextAccessor)
    {
        this.cache = cache;
        this.databaseMode = databaseMode;
        this.httpContextAccessor = httpContextAccessor;
        this.dataStoreFactory = dataStoreFactory;
    }

    public void Bootstrap()
    {
        if (this.databaseMode.DatabaseMode == DatabaseMode.ReadOnly)
            return;

        Remap<PermissionPolicy>();

        if (this.List().Any())
        {
            return;
        }
    }

    public IEnumerable<PermissionPolicy> List()
    {
        using (var s = GetStore())
        {
            var policies = s.LoadAll<PermissionPolicy>();

            foreach (PermissionPolicy p in policies)
            {
                yield return p;
            }
        }
    }

    public T Update<T>(T policy) where T : PermissionPolicy
    {
        using (var s = GetStore())
        {
            // This needs to go back in as it causes the app to crash.   
            this.cache.Remove(Constants.PermissionPolicyCacheKey);

            var existing = s.Find("Key", policy.Key) ;
            foreach (var e in existing)
            {
                s.Delete(e);
            }
            
            var _ = s.Save(policy);

            return policy;
        }
    }

    public void Clear()
    {
        if (this.databaseMode.DatabaseMode == DatabaseMode.ReadOnly)
            return;

        using (var s = GetStore())
        {
            s.DeleteAll();
        }

        this.cache.Remove(Constants.PermissionPolicyCacheKey);
    }

    private DynamicDataStore GetStore()
    {
        var storeParams = new StoreDefinitionParameters();
        storeParams.IndexNames.Add("Id");
        return dataStoreFactory.CreateStore(nameof(PermissionPolicy), typeof(PermissionPolicy), storeParams);
    }

    private void Remap<T>()
    {
        if (this.databaseMode.DatabaseMode == DatabaseMode.ReadOnly)
            return;

        var definition = StoreDefinition.Get(typeof(T).FullName);

        if (definition != null)
        {
            definition.Remap(typeof(PermissionPolicy));

            definition.CommitChanges();
        }
    }
}
