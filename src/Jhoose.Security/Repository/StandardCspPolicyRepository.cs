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

namespace Jhoose.Security.Repository
{
    public class StandardCspPolicyRepository : BaseCspPolicyRepository, IDisposable
    {
        protected readonly DynamicDataStoreFactory dataStoreFactory;
        protected readonly ICacheManager cache;
        private readonly IDatabaseMode databaseMode;
        private readonly ILogger<StandardCspPolicyRepository> logger;
        private static object _lock = new();

        private DynamicDataStore? _store;

        protected Lazy<DynamicDataStore> store => new Lazy<DynamicDataStore>(() =>
        {
            if (_store is null)
            {
                var storeParams = new StoreDefinitionParameters();
                storeParams.IndexNames.Add("Id");

                _store = dataStoreFactory.CreateStore(typeof(CspPolicy), storeParams);
            }

            return _store;

        });

        private DynamicDataStore? _settingsStore;
        private bool disposedValue;

        protected Lazy<DynamicDataStore> settingsStore => new Lazy<DynamicDataStore>(() =>
        {
            if (_settingsStore is null)
            {
                var storeParams = new StoreDefinitionParameters();

                _settingsStore = dataStoreFactory.CreateStore(typeof(CspSettings).FullName, typeof(CspSettings));
            }

            return _settingsStore;
        });

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

            lock (_lock)
            {
                var policies = store.Value.LoadAll<CspPolicy>();

                return policies.ToList();
            }
        }

        public override CspPolicy Update(CspPolicy policy)
        {
            lock (_lock)
            {
                // This needs to go back in as it causes the app to crash.   
                this.cache.Remove(Constants.PolicyCacheKey);

                store.Value.Save(policy);
                return policy;
            }
        }

        public override CspSettings Settings()
        {
            lock (_lock)
            {
                var s = settingsStore.Value.Items<CspSettings>().FirstOrDefault();

                s = s ?? new CspSettings
                {
                    Id = Guid.NewGuid(),
                    Mode = "report",
                    ReportingUrl = string.Empty
                };
                return s;
            }
        }

        public override bool SaveSettings(CspSettings settings)
        {
            lock (_lock)
            {
                this.cache.Remove(Constants.SettingsCacheKey);
                this.cache.Remove(Constants.PolicyCacheKey);

                try
                {
                    var id = settingsStore.Value.Save(settings, Identity.NewIdentity(settings.Id));

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

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    this.settingsStore.Value.Dispose();
                    this.store.Value.Dispose();
                }

                disposedValue = true;
            }
        }


        public void Dispose()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
