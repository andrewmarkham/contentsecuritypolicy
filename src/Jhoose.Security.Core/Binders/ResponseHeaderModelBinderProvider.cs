using System;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Collections.Generic;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.SecurityHeaders;
using System.Threading.Tasks;
using System.Text.Json.Nodes;
using System.Text.Json;
using System.IO;
using System.Text;

namespace Jhoose.Security.Core.Binders
{
    public class ResponseHeaderModelBinderProvider : IModelBinderProvider
    {
        public IModelBinder? GetBinder(ModelBinderProviderContext context)
        {
            if (context.Metadata.ModelType != typeof(ResponseHeader))
            {
                return null;
            }

            return new ResponseHeaderModelBinder();
        }
    }

    public class ResponseHeaderModelBinder : IModelBinder
    {
        private static JsonSerializerOptions serializerOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        public async Task BindModelAsync(ModelBindingContext bindingContext)
        {

            JsonNode? jsonNode;
            ResponseHeader? responseHeader;

#if NET8_0_OR_GREATER

            jsonNode = await JsonNode.ParseAsync(bindingContext.ActionContext.HttpContext.Request.Body);
#else
            string json;
            using (var reader = new StreamReader(bindingContext.ActionContext.HttpContext.Request.Body, Encoding.UTF8))
                json = await reader.ReadToEndAsync();

            jsonNode = JsonNode.Parse(json);
#endif
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
}

