using Microsoft.AspNetCore.Mvc.ModelBinding;
using Jhoose.Security.Core.Models.CSP;

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

