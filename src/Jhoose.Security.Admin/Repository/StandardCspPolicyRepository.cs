using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.Data.Dynamic;
using EPiServer.Framework.Cache;
using Jhoose.Security.Core;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Repository;
using Microsoft.Extensions.Caching.Memory;

namespace Jhoose.Security.Admin.Repository
{
    public class StandardCspPolicyRepository: BaseCspPolicyRepository
    {
        protected readonly DynamicDataStoreFactory dataStoreFactory;
        protected readonly ISynchronizedObjectInstanceCache cache;
        protected Lazy<DynamicDataStore> store => new Lazy<DynamicDataStore>(() => {

            var storeParams = new StoreDefinitionParameters();
            storeParams.IndexNames.Add("Id");
            
            return dataStoreFactory.CreateStore(typeof(CspPolicy), storeParams); 

        }, false);

        public StandardCspPolicyRepository()
        {
        }

        public StandardCspPolicyRepository(DynamicDataStoreFactory dataStoreFactory, ISynchronizedObjectInstanceCache cache)
        {
            this.cache = cache;
            this.dataStoreFactory = dataStoreFactory;
        }

        public override void Bootstrap()
        {
            var storeDefinition = StoreDefinition.Get(typeof(CspPolicy).FullName);
            
            if (storeDefinition != null) {
                storeDefinition.Remap(typeof(CspPolicy));
                storeDefinition.CommitChanges();
            }

            base.Bootstrap();
        }
        
        public override List<CspPolicy> List()
        {
            var policies = store.Value.LoadAll<CspPolicy>();

            return policies.ToList();
        }

        public override CspPolicy Update(CspPolicy policy)
        {
            // This needs to go back in as it causes the app to crash.   
            this.cache.Remove(Constants.CacheKey);

            store.Value.Save(policy);
            return policy;
        }
    }
}
