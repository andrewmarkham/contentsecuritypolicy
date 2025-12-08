using Jhoose.Security.Models.CSP;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Binders;

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