using Jhoose.Security.Features.CSP.Models;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Features.CSP.Binders;

public class CspPolicyModelBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
    {
        if (context.Metadata.ModelType != typeof(CspPolicy))
        {
            return null;
        }

        return new CspPolicyModelBinder();
    }
}