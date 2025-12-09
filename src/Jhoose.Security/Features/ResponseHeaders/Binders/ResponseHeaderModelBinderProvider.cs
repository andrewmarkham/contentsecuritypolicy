using Jhoose.Security.Features.ResponseHeaders.Models;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Features.ResponseHeaders.Binders;

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