using Jhoose.Security.Features.Settings.Models;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Features.Settings.Binders;

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