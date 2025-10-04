using System;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace Jhoose.Security.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class ApiKeyAuthorizationAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var service = context.HttpContext.RequestServices.GetService<IAuthKeyService>();

        var authHeader = context.HttpContext.Request.Headers[Constants.ApiKey];

        if (!service?.Validate(authHeader) ?? false)
        {
            context.Result = new UnauthorizedResult();
        }
    }
}