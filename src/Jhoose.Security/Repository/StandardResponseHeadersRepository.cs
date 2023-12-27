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

        /*
        private readonly Dictionary<string, Type> storeTypes = new Dictionary<string, Type>
            {
                { nameof(StrictTransportSecurityHeader),  typeof(StrictTransportSecurityHeader) },
                { nameof(XFrameOptionsHeader), typeof(XFrameOptionsHeader) },
                { nameof(XContentTypeOptionsHeader), typeof(XContentTypeOptionsHeader) },
                { nameof(XPermittedCrossDomainPoliciesHeader), typeof(XPermittedCrossDomainPoliciesHeader) },
                { nameof(ReferrerPolicyHeader), typeof(ReferrerPolicyHeader) },
                { nameof(CrossOriginEmbedderPolicyHeader), typeof(CrossOriginEmbedderPolicyHeader) },
                { nameof(CrossOriginOpenerPolicyHeader), typeof(CrossOriginOpenerPolicyHeader) },
                { nameof(CrossOriginResourcePolicyHeader), typeof(CrossOriginResourcePolicyHeader) }
            };
        */
        protected Lazy<DynamicDataStore> store => new Lazy<DynamicDataStore>(() =>
        {

            var storeParams = new StoreDefinitionParameters();
            storeParams.IndexNames.Add("Id");

            //return dataStoreFactory.CreateStore(nameof(ResponseHeader), storeTypes, storeParams);
            return dataStoreFactory.CreateStore(nameof(ResponseHeader), typeof(ResponseHeaderStorageItem<>), storeParams);

        }, false);

        /*
        protected Lazy<DynamicDataStore> settingsStore => new Lazy<DynamicDataStore>(() =>
        {


            var storeParams = new StoreDefinitionParameters();
            storeParams.IndexNames.Add("Id");

            return dataStoreFactory.CreateStore(nameof(ResponseHeader), storeTypes, storeParams);

        }, false);
        */

        /*
        public StandardResponseHeadersRepository()
        {
        }
        */

        public StandardResponseHeadersRepository(DynamicDataStoreFactory dataStoreFactory,
            ICacheManager cache)
        {
            this.cache = cache;
            this.dataStoreFactory = dataStoreFactory;

        }

        public void Bootstrap()
        {
            this.dataStoreFactory.DeleteStore(nameof(ResponseHeader), true);

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

            //return policies.Select(p => p.Header).ToList();

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

    [EPiServerDataContract]
    public class ResponseHeaderStorageItem<T> : IDynamicData where T : ResponseHeader
    {
        public ResponseHeaderStorageItem()
        {

        }
        /*
        public ResponseHeaderStorageItem(string typeName, string serializedValue)
        {
            this.TypeName = typeName;
            this.SerializedValue = serializedValue;

            Type t = Type.GetType(this.TypeName);
            this.Header = (T)JsonConvert.DeserializeObject(serializedValue, t);
            this.Id = Identity.NewIdentity(this.Header.Id);
        }
        */

        public ResponseHeaderStorageItem(T header)
        {
            //this.Header = header;
            this.TypeName = header.GetType().AssemblyQualifiedName;
            this.SerializedValue = JsonConvert.SerializeObject(header);
            this.Id = Identity.NewIdentity(header.Id);
        }

        //public T Header { get; private set; }


        [EPiServerDataMember]
        public string TypeName { get; set; } = string.Empty;

        [EPiServerDataMember]
        public string SerializedValue { get; set; } = string.Empty;

        [EPiServerDataMember]
        public Identity Id { get; set; } = Identity.NewIdentity();
    }

}
