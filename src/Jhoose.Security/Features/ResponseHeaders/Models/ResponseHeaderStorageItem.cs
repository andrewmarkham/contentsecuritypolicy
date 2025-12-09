using EPiServer.Data;
using EPiServer.Data.Dynamic;

namespace Jhoose.Security.Features.ResponseHeaders.Models;

[EPiServerDataContract]
public class ResponseHeaderStorageItem<T> : IDynamicData where T : ResponseHeader
{
    public ResponseHeaderStorageItem()
    {

    }

    public ResponseHeaderStorageItem(T header)
    {
        this.TypeName = header.GetType().AssemblyQualifiedName ?? string.Empty;
        this.SerializedValue = System.Text.Json.JsonSerializer.Serialize(header);
        this.Id = Identity.NewIdentity(header.Id);
    }

    [EPiServerDataMember]
    public string TypeName { get; set; } = string.Empty;

    [EPiServerDataMember]
    public string SerializedValue { get; set; } = string.Empty;

    [EPiServerDataMember]
    public Identity Id { get; set; } = Identity.NewIdentity();
}