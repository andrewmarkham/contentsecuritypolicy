using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.Data.Dynamic;
using EPiServer.Framework.Cache;
using Jhoose.Security.Core;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.CSP;
using Jhoose.Security.Core.Repository;

namespace Jhoose.Security.Repository
{
    public class StandardCspPolicyRepository : BaseCspPolicyRepository
    {
        protected readonly DynamicDataStoreFactory dataStoreFactory;
        protected readonly ICacheManager cache;
        protected Lazy<DynamicDataStore> store => new Lazy<DynamicDataStore>(() =>
        {

            var storeParams = new StoreDefinitionParameters();
            storeParams.IndexNames.Add("Id");

            return dataStoreFactory.CreateStore(typeof(CspPolicy), storeParams);

        }, false);

        protected Lazy<DynamicDataStore> settingsStore => new Lazy<DynamicDataStore>(() =>
        {

            var storeParams = new StoreDefinitionParameters();
            storeParams.IndexNames.Add("Id");

            return dataStoreFactory.CreateStore(typeof(CspSettings), storeParams);

        }, false);

        public StandardCspPolicyRepository()
        {
        }

        public StandardCspPolicyRepository(DynamicDataStoreFactory dataStoreFactory, ICacheManager cache)
        {
            this.cache = cache;
            this.dataStoreFactory = dataStoreFactory;

        }

        public override void Bootstrap()
        {

            Remap<CspPolicy>();
            Remap<CspOptions>();
            Remap<SchemaSource>();
            Remap<CspSettings>();
            Remap<SandboxOptions>();

            base.Bootstrap();
        }

        public override List<CspPolicy> List()
        {

            //store.Value.DeleteAll();
            var policies = store.Value.LoadAll<CspPolicy>();

            return policies.ToList();
        }

        public override CspPolicy Update(CspPolicy policy)
        {
            // This needs to go back in as it causes the app to crash.   
            this.cache.Remove(Constants.PolicyCacheKey);

            store.Value.Save(policy);
            return policy;
        }

        public override CspSettings Settings()
        {
            return settingsStore.Value.Load<CspSettings>(EPiServer.Data.Identity.NewIdentity(Guid.Parse("3f15cad4-cd57-41c3-95c8-f7f62a2759ea"))) ?? new CspSettings
            {
                Mode = "report",
                ReportingUrl = string.Empty
            };
        }

        public override bool SaveSettings(CspSettings settings)
        {
            this.cache.Remove(Constants.SettingsCacheKey);

            try
            {
                settingsStore.Value.Save(settings);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private void Remap<T>()
        {
            var definition = StoreDefinition.Get(typeof(T).FullName);

            if (definition != null)
            {
                definition.Remap(typeof(T));
                definition.CommitChanges();
            }
        }
    }
}
