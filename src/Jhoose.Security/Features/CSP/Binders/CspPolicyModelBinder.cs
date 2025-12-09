
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

using Jhoose.Security.Features.CSP.Models;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Features.CSP.Binders;

public class CspPolicyModelBinder : IModelBinder
{
    private static readonly JsonSerializerOptions serializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {
        JsonNode? jsonNode;
        CspPolicy? cspPolicy;

        jsonNode = await JsonNode.ParseAsync(bindingContext.ActionContext.HttpContext.Request.Body);

        if (jsonNode is not null)
        {
            cspPolicy = jsonNode.Deserialize<CspPolicy>(serializerOptions);
            bindingContext.Result = ModelBindingResult.Success(cspPolicy);
        }
        else
        {
            bindingContext.Result = ModelBindingResult.Failed();
        }
    }
}