using System;

using Jhoose.Security.Features.Api.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Jhoose.Security.Features.Api.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class ApiKeyAuthorizationAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var service = context.HttpContext.RequestServices.GetService<IAuthKeyService>();

        var authHeader = context.HttpContext.Request.Headers[Constants.Authentication.ApiKey];

        var routeData = context.HttpContext.GetRouteData();
        var headerRequestJson = routeData.Values["headerRequest"] as string;
        var headerRequest = headerRequestJson is not null ? System.Text.Json.JsonSerializer.Deserialize<HeaderRequest>(headerRequestJson) : null;
        var host = headerRequest?.HostName ?? string.Empty;

        if (!service?.Validate(authHeader, host) ?? false)
        {
            context.Result = new UnauthorizedResult();
        }
    }
}