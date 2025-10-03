using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

using Jhoose.Security.Core.Models.CSP;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Core.Binders;

public class CspSettingsModelBinder : IModelBinder
{
    private static readonly JsonSerializerOptions serializerOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {

        JsonNode? jsonNode;
        CspSettings? cspSettings;

#if NET8_0_OR_GREATER

        jsonNode = await JsonNode.ParseAsync(bindingContext.ActionContext.HttpContext.Request.Body);
#else
        string json;
        using (var reader = new StreamReader(bindingContext.ActionContext.HttpContext.Request.Body, Encoding.UTF8))
            json = await reader.ReadToEndAsync();

        jsonNode = JsonNode.Parse(json);
#endif

        if (jsonNode is not null)
        {
            cspSettings = jsonNode.Deserialize<CspSettings>(serializerOptions);
            bindingContext.Result = ModelBindingResult.Success(cspSettings);
        }
        else
        {
            bindingContext.Result = ModelBindingResult.Failed();
        }
    }
}