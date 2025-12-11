using System;
using System.Collections.Generic;
using System.Linq;

using EPiServer.Data;
using EPiServer.Data.Dynamic;

using Jhoose.Security.Features.Core.Cache;
using Jhoose.Security.Features.Settings.Models;

using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Settings.Repository;

public class SettingsRepository : ISettingsRepository
{
    public SettingsRepository(DynamicDataStoreFactory dataStoreFactory,
    ICacheManager cache,
    IDatabaseMode databaseMode,
    ILogger<SettingsRepository> logger
    )
    {
        this.cache = cache;
        this.databaseMode = databaseMode;
        this.logger = logger;
        this.dataStoreFactory = dataStoreFactory;

    }

    private readonly ICacheManager cache;
    private readonly IDatabaseMode databaseMode;
    private readonly ILogger<SettingsRepository> logger;
    protected readonly DynamicDataStoreFactory dataStoreFactory;
    
    public  CspSettings Settings()
    {
        using (var ss = GetSettingstore())
        {
            var s = ss.Items<CspSettings>().FirstOrDefault();

            s = s ?? new CspSettings
            {
                Id = Guid.NewGuid(),
                Mode = "report",
                PermissionMode = "off",
                ReportingUrl = string.Empty,
                WebhookUrls = new List<string>(),
                AuthenticationKeys = new List<Models.AuthenticationKey>()
            };
            return s;
        }
    }

    public  bool SaveSettings(CspSettings settings)
    {
        using (var ss = GetSettingstore())
        {
            this.cache.Remove(Constants.SettingsCacheKey);
            this.cache.Remove(Constants.PolicyCacheKey);
            this.cache.Remove(Constants.ResponseHeadersCacheKey);
            this.cache.Remove(Constants.PermissionPolicyCacheKey);
   
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

    public void Bootstrap()
    {
        if (this.databaseMode.DatabaseMode == DatabaseMode.ReadOnly)
            return;

        Remap<CspSettings>();
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
    private DynamicDataStore GetSettingstore()
    {
        var storeParams = new StoreDefinitionParameters();

        return dataStoreFactory.CreateStore(typeof(CspSettings).FullName, typeof(CspSettings));
    }
}
