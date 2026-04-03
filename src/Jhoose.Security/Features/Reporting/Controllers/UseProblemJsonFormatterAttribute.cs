using System.Buffers;
using System.Linq;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.ObjectPool;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Features.Reporting.Controllers;

public class UseProblemJsonFormatterAttribute : ActionFilterAttribute, IControllerModelConvention, IActionModelConvention
{
    public void Apply(ControllerModel controller)
    {
        foreach (var action in controller.Actions)
        {
            Apply(action);
        }
    }

    public void Apply(ActionModel action)
    {
        // Set the model binder to NewtonsoftJsonBodyModelBinder for parameters that are bound to the request body.
        var parameters = action.Parameters.Where(p => p.BindingInfo?.BindingSource == BindingSource.Body);
        foreach (var p in parameters)
        {
            p.BindingInfo.BinderType = typeof(ProblemJsonBodyModelBinder);
        }
    }
}

public class ProblemJsonBodyModelBinder : BodyModelBinder
{
    public ProblemJsonBodyModelBinder(
        ILoggerFactory loggerFactory,
        //ArrayPool charPool,
        IHttpRequestStreamReaderFactory readerFactory,
        ObjectPoolProvider objectPoolProvider,
        //IOptions mvcOptions,
        IOptions<JsonOptions> jsonOptions)
        : base(GetInputFormatters(loggerFactory, objectPoolProvider, jsonOptions), readerFactory)
    {
    }

    private static IInputFormatter[] GetInputFormatters(
        ILoggerFactory loggerFactory,
        //ArrayPool charPool,
        ObjectPoolProvider objectPoolProvider,
        //IOptions mvcOptions,
        IOptions<JsonOptions> jsonOptions)
    {
        var jsonOptionsValue = jsonOptions.Value;
        return
        [
            new ProblemJsonFormatter()
        ];
    }
}