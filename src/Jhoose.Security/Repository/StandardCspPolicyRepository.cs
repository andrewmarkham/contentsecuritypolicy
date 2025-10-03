using System;
using System.Collections.Generic;
using System.Linq;

using EPiServer.Data;
using EPiServer.Data.Dynamic;

using Jhoose.Security.Core;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Models.CSP;
using Jhoose.Security.Core.Repository;

using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Repository;

public class StandardCspPolicyRepository : BaseCspPolicyRepository
{
    protected readonly DynamicDataStoreFactory dataStoreFactory;
    protected readonly ICacheManager cache;
    private readonly IDatabaseMode databaseMode;
    private readonly ILogger<StandardCspPolicyRepository> logger;

    private DynamicDataStore GetStore()
    {
        var storeParams = new StoreDefinitionParameters();
        storeParams.IndexNames.Add("Id");
        return dataStoreFactory.CreateStore(typeof(CspPolicy), storeParams);
    }

    private DynamicDataStore GetSettingstore()
    {
        var storeParams = new StoreDefinitionParameters();

        return dataStoreFactory.CreateStore(typeof(CspSettings).FullName, typeof(CspSettings));
    }

    public StandardCspPolicyRepository(DynamicDataStoreFactory dataStoreFactory,
        ICacheManager cache,
        IDatabaseMode databaseMode,
        ILogger<StandardCspPolicyRepository> logger
        )
    {
        this.cache = cache;
        this.databaseMode = databaseMode;
        this.logger = logger;
        this.dataStoreFactory = dataStoreFactory;

    }

    public override void Bootstrap()
    {
        if (this.databaseMode.DatabaseMode == DatabaseMode.ReadOnly)
            return;

        Remap<CspPolicy>();
        Remap<CspOptions>();
        Remap<SchemaSource>();
        Remap<CspSettings>();
        Remap<SandboxOptions>();

        base.Bootstrap();
    }

    public override List<CspPolicy> List()
    {
        using (var s = GetStore())
        {
            var policies = s.LoadAll<CspPolicy>();

            return policies.ToList();
        }
    }

    public override CspPolicy Update(CspPolicy policy)
    {
        using (var s = GetStore())
        {
            // This needs to go back in as it causes the app to crash.   
            this.cache.Remove(Constants.PolicyCacheKey);

            s.Save(policy);
            return policy;
        }
    }

    public override CspSettings Settings()
    {
        using (var ss = GetSettingstore())
        {
            var s = ss.Items<CspSettings>().FirstOrDefault();

            s = s ?? new CspSettings
            {
                Id = Guid.NewGuid(),
                Mode = "report",
                ReportingUrl = string.Empty,
                WebhookUrls = new List<string>(),
                AuthenticationKeys = new List<Core.Models.AuthenticationKey>()
            };
            return s;
        }
    }

    public override bool SaveSettings(CspSettings settings)
    {
        using (var ss = GetSettingstore())
        {
            this.cache.Remove(Constants.SettingsCacheKey);
            this.cache.Remove(Constants.PolicyCacheKey);
            this.cache.Remove(Constants.ResponseHeadersCacheKey);

            try
            {
                var id = ss.Save(settings, Identity.NewIdentity(settings.Id));

                return true;
            }
            catch (Exception ex)
            {
                this.logger.LogError(ex, "Error saving settings");
                return false;
            }
        }
    }


    private void Remap<T>()
    {
        if (this.databaseMode.DatabaseMode == DatabaseMode.ReadOnly)
            return;

        var definition = StoreDefinition.Get(typeof(T).FullName);

        if (definition != null)
        {
            definition.Remap(typeof(T));
            definition.CommitChanges();
        }

    }
}