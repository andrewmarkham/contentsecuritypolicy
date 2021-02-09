using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace EpiserverAdmin.Infrastructure
{
    [AttributeUsage(AttributeTargets.Class, Inherited = true)]
    public class RegisterFirstAdminWithLocalRequestAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (!AdministratorRegistrationPageMiddleware.IsEnabled)
            {
                context.Result = new NotFoundResult();
                return;
            }
        }
    }
}