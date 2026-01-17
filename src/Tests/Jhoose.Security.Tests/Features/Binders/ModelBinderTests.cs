using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Jhoose.Security.Features.CSP.Binders;
using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.ResponseHeaders.Binders;
using Jhoose.Security.Features.ResponseHeaders.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Routing;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.Binders;

[TestFixture]
public class ModelBinderTests
{
    [Test]
    public async Task CspPolicyModelBinder_InvalidJson_FailsWithModelError()
    {
        var binder = new CspPolicyModelBinder();
        var context = CreateBindingContext<CspPolicy>("{invalid");

        await binder.BindModelAsync(context);

        Assert.That(context.Result.IsModelSet, Is.False);
        Assert.That(context.ModelState.ErrorCount, Is.EqualTo(1));
        Assert.That(GetSingleError(context), Is.EqualTo("Request body was not valid JSON."));
    }

    [Test]
    public async Task ResponseHeaderModelBinder_InvalidJson_FailsWithModelError()
    {
        var binder = new ResponseHeaderModelBinder();
        var context = CreateBindingContext<ResponseHeader>("{invalid");

        await binder.BindModelAsync(context);

        Assert.That(context.Result.IsModelSet, Is.False);
        Assert.That(context.ModelState.ErrorCount, Is.EqualTo(1));
        Assert.That(GetSingleError(context), Is.EqualTo("Request body was not valid JSON."));
    }

    [Test]
    public async Task ResponseHeaderModelBinder_UnsupportedType_FailsWithModelError()
    {
        var binder = new ResponseHeaderModelBinder();
        var context = CreateBindingContext<ResponseHeader>("{\"name\":\"X-Unknown\"}");

        await binder.BindModelAsync(context);

        Assert.That(context.Result.IsModelSet, Is.False);
        Assert.That(context.ModelState.ErrorCount, Is.EqualTo(1));
        Assert.That(GetSingleError(context), Is.EqualTo("Unsupported response header type 'X-Unknown'."));
    }

    private static ModelBindingContext CreateBindingContext<T>(string body)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(body));

        var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor(), new ModelStateDictionary());
        var metadataProvider = new EmptyModelMetadataProvider();
        var metadata = metadataProvider.GetMetadataForType(typeof(T));

        return DefaultModelBindingContext.CreateBindingContext(actionContext, new CompositeValueProvider(), metadata, bindingInfo: null, modelName: "model");
    }

    private static string GetSingleError(ModelBindingContext context)
    {
        return context.ModelState.Values.Single().Errors.Single().ErrorMessage;
    }
}
