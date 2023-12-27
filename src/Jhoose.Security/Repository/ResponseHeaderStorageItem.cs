using EPiServer.Data;
using EPiServer.Data.Dynamic;
using Jhoose.Security.Core.Models;
using Newtonsoft.Json;

namespace Jhoose.Security.Repository
{
    [EPiServerDataContract]
    public class ResponseHeaderStorageItem<T> : IDynamicData where T : ResponseHeader
    {
        public ResponseHeaderStorageItem()
        {

        }

        public ResponseHeaderStorageItem(T header)
        {
            //this.Header = header;
            this.TypeName = header.GetType().AssemblyQualifiedName ?? string.Empty;
            this.SerializedValue = JsonConvert.SerializeObject(header);
            this.Id = Identity.NewIdentity(header.Id);
        }

        [EPiServerDataMember]
        public string TypeName { get; set; } = string.Empty;

        [EPiServerDataMember]
        public string SerializedValue { get; set; } = string.Empty;

        [EPiServerDataMember]
        public Identity Id { get; set; } = Identity.NewIdentity();
    }

}
