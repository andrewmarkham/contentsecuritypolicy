using System;
using System.Threading.Tasks;

using Jhoose.Security.Features.Api.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace Jhoose.Security.Features.Api.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class ApiKeyAuthorizationAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var service = context.HttpContext.RequestServices.GetService<IAuthKeyService>();
        context.HttpContext.Request.EnableBuffering();
        
        var authHeader = context.HttpContext.Request.Headers[Constants.Authentication.ApiKey];

        var json = await new System.IO.StreamReader(context.HttpContext.Request.Body).ReadToEndAsync();
        
        context.HttpContext.Request.Body.Position = 0;

        var headerRequest = System.Text.Json.JsonSerializer.Deserialize<HeaderRequest>(json);
        var host = headerRequest?.HostName ?? string.Empty;

        if (!service?.Validate(authHeader, host) ?? false)
        {
            context.Result = new UnauthorizedResult();
        }
    }
}