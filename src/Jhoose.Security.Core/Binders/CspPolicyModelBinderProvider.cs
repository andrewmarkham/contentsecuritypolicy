using Jhoose.Security.Core.Models.CSP;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Jhoose.Security.Core.Binders
{
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
}