using Jhoose.Security.Models.CSP;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Binders;

public class CspSettingsModelBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
    {
        if (context.Metadata.ModelType != typeof(CspSettings))
        {
            return null;
        }

        return new CspSettingsModelBinder();
    }
}