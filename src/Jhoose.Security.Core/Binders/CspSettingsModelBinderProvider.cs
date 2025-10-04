using Jhoose.Security.Core.Models.CSP;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Core.Binders;

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