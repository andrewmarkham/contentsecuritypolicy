using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

using Jhoose.Security.Features.Settings.Models;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Features.Settings.Binders;

public class CspSettingsModelBinder : IModelBinder
{
    private static readonly JsonSerializerOptions serializerOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {

        JsonNode? jsonNode;
        CspSettings? cspSettings;

        jsonNode = await JsonNode.ParseAsync(bindingContext.ActionContext.HttpContext.Request.Body);

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