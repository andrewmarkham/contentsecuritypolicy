using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

using Jhoose.Security.Models;
using Jhoose.Security.Models.SecurityHeaders;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Binders;

public class ResponseHeaderModelBinder : IModelBinder
{
    private static readonly JsonSerializerOptions serializerOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {

        JsonNode? jsonNode;
        ResponseHeader? responseHeader;

        jsonNode = await JsonNode.ParseAsync(bindingContext.ActionContext.HttpContext.Request.Body);

        var typeMappings = new Dictionary<string, Type>
        {
            { "Cross-Origin-Embedder-Policy", typeof(CrossOriginEmbedderPolicyHeader) },
            { "Cross-Origin-Opener-Policy", typeof(CrossOriginOpenerPolicyHeader) },
            { "Cross-Origin-Resource-Policy", typeof(CrossOriginResourcePolicyHeader) },
            { "Referrer-Policy", typeof(ReferrerPolicyHeader) },
            { "Strict-Transport-Security", typeof(StrictTransportSecurityHeader) },
            { "X-Content-Type-Options", typeof(XContentTypeOptionsHeader) },
            { "X-Frame-Options", typeof(XFrameOptionsHeader) },
            { "X-Permitted-Cross-Domain-Policies", typeof(XPermittedCrossDomainPoliciesHeader) },
        };

        if (jsonNode is not null)
        {
            var responseName = jsonNode["name"];

            typeMappings.TryGetValue(responseName?.GetValue<string>() ?? string.Empty, out var bindingType);

            if (bindingType is not null)
            {
                responseHeader = jsonNode.Deserialize(bindingType, serializerOptions) as ResponseHeader;
                bindingContext.Result = ModelBindingResult.Success(responseHeader);
            }
            else
            {
                bindingContext.Result = ModelBindingResult.Failed();
            }
        }
    }
}