using System;
using EpiserverAdmin.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;

namespace EpiserverAdmin.Filter
{
    internal class AdministratorRegistrationStartupFilter : IStartupFilter
    {
        public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
        {
            return builder =>
            {
                builder.UseMiddleware<AdministratorRegistrationPageMiddleware>();
                next(builder);
            };
        }
    }
}