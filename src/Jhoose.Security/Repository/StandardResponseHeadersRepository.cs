using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using EPiServer.Data;
using EPiServer.Data.Dynamic;
using Jhoose.Security.Core;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.SecurityHeaders;
using Jhoose.Security.Core.Repository;
using Newtonsoft.Json;

namespace Jhoose.Security.Repository
{
    public class StandardResponseHeadersRepository : IResponseHeadersRepository
    {
        protected readonly DynamicDataStoreFactory dataStoreFactory;
        protected readonly ICacheManager cache;

        private readonly IDatabaseMode databaseMode;
        protected Lazy<DynamicDataStore> store => new Lazy<DynamicDataStore>(() =>
        {

            var storeParams = new StoreDefinitionParameters();
            storeParams.IndexNames.Add("Id");
            return dataStoreFactory.CreateStore(nameof(ResponseHeader), typeof(ResponseHeaderStorageItem<>), storeParams);

        }, false);

        public StandardResponseHeadersRepository(DynamicDataStoreFactory dataStoreFactory,
            ICacheManager cache,
            IDatabaseMode databaseMode)
        {
            this.cache = cache;
            this.databaseMode = databaseMode;
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
            var policies = store.Value.LoadAll<ResponseHeaderStorageItem<ResponseHeader>>();

            foreach (var p in policies)
            {
                var json = p.SerializedValue;

                Type t = Type.GetType(p.TypeName);
                var dt = (ResponseHeader)JsonConvert.DeserializeObject(json, t);

                yield return dt;

            }
        }

        public T Update<T>(T policy) where T : ResponseHeader
        {
            // This needs to go back in as it causes the app to crash.   
            this.cache.Remove(Constants.PolicyCacheKey);

            var _ = store.Value.Save(new ResponseHeaderStorageItem<T>(policy));

            return policy;
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
    }
}
