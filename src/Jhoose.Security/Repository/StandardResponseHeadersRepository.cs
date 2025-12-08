using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

using EPiServer.Data;
using EPiServer.Data.Dynamic;

using Jhoose.Security.Cache;
using Jhoose.Security.Configuration;
using Jhoose.Security.Models;

using Jhoose.Security.Models.SecurityHeaders;

//using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Repository;

public class StandardResponseHeadersRepository : IResponseHeadersRepository
{
    protected readonly DynamicDataStoreFactory dataStoreFactory;
    protected readonly ICacheManager cache;

    private readonly IDatabaseMode databaseMode;
    //private readonly IHttpContextAccessor httpContextAccessor;

    public StandardResponseHeadersRepository(DynamicDataStoreFactory dataStoreFactory,
        ICacheManager cache,
        IDatabaseMode databaseMode
        //IHttpContextAccessor httpContextAccessor
        )
    {
        this.cache = cache;
        this.databaseMode = databaseMode;
        //this.httpContextAccessor = httpContextAccessor;
        this.dataStoreFactory = dataStoreFactory;
    }

    public void Bootstrap()
    {
        if (this.databaseMode.DatabaseMode == DatabaseMode.ReadOnly)
            return;

        Remap<ResponseHeader>();

        if (this.List().Any())
        {
            return;
        }

        var defaultOptions = new JhooseSecurityOptions();
        foreach (var p in defaultOptions.Headers)
        {
            this.Update(p);
        }
    }

    public IEnumerable<ResponseHeader> List()
    {
        using (var s = GetStore())
        {
            var policies = s.LoadAll<ResponseHeaderStorageItem<ResponseHeader>>();

            foreach (ResponseHeaderStorageItem<ResponseHeader> p in policies)
            {
                var responseHeader = JsonSerializer.Deserialize<ResponseHeader>(p.SerializedValue);

                yield return FixResponseHeaderHelper.IsFixRequired(responseHeader, p.TypeName) ? 
                                FixResponseHeaderHelper.ApplyFix(responseHeader, p.SerializedValue) : 
                                responseHeader!;
            }
        }
    }


    public T Update<T>(T policy) where T : ResponseHeader
    {
        using (var s = GetStore())
        {
            // This needs to go back in as it causes the app to crash.   
            this.cache.Remove(Constants.ResponseHeadersCacheKey);

            var _ = s.Save(new ResponseHeaderStorageItem<T>(policy));

            return policy;
        }
    }

    private DynamicDataStore GetStore()
    {
        var storeParams = new StoreDefinitionParameters();
        storeParams.IndexNames.Add("Id");
        return dataStoreFactory.CreateStore(nameof(ResponseHeader), typeof(ResponseHeaderStorageItem<>), storeParams);
    }

    private void Remap<T>()
    {
        if (this.databaseMode.DatabaseMode == DatabaseMode.ReadOnly)
            return;

        var definition = StoreDefinition.Get(typeof(T).FullName);

        if (definition != null)
        {
            definition.Remap(typeof(ResponseHeaderStorageItem<StrictTransportSecurityHeader>));
            definition.Remap(typeof(ResponseHeaderStorageItem<XFrameOptionsHeader>));
            definition.Remap(typeof(ResponseHeaderStorageItem<XContentTypeOptionsHeader>));
            definition.Remap(typeof(ResponseHeaderStorageItem<XPermittedCrossDomainPoliciesHeader>));
            definition.Remap(typeof(ResponseHeaderStorageItem<ReferrerPolicyHeader>));
            definition.Remap(typeof(ResponseHeaderStorageItem<CrossOriginEmbedderPolicyHeader>));
            definition.Remap(typeof(ResponseHeaderStorageItem<CrossOriginOpenerPolicyHeader>));
            definition.Remap(typeof(ResponseHeaderStorageItem<CrossOriginResourcePolicyHeader>));

            definition.CommitChanges();
        }
    }

    private Type GetType(string typeName)
    {
        return Type.GetType(typeName, assemblyName =>
            {
                return AppDomain.CurrentDomain.GetAssemblies().SingleOrDefault(a => a.GetName().Name == assemblyName.Name);
            },
            (assembly, typeName, caseInsensitive) =>
            {
                if (caseInsensitive)
                    return assembly?.GetTypes().SingleOrDefault(t => t.FullName?.Equals(typeName, StringComparison.InvariantCultureIgnoreCase) ?? false);
                else
                    return assembly?.GetTypes().SingleOrDefault(t => t.FullName == typeName);
            })!;
    }
}
