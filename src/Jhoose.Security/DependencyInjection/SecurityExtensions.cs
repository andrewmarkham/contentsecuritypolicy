using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using EPiServer.Shell.Modules;
using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Repository;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using System;
using Jhoose.Security.Core.Cache;

namespace Jhoose.Security.DependencyInjection
{
    public static class SecurityExtensions
    {
        public static IServiceCollection AddJhooseSecurity(this IServiceCollection services, 
                IConfiguration configuration, 
                Action<SecurityOptions> options = null)
        {
            Action<SecurityOptions> defaultOptions = (op) =>  op.ExclusionPaths = new List<string> { "/episerver" };

            services.AddHostedService<InitialiseHostedService>();

            if (options != null)
            {
                services.Configure<SecurityOptions>(options);
            }
            else
            {
                var configOptions = configuration.GetSection(SecurityOptions.JhooseSecurity);

                if (configOptions.Value == null) {
                    services.Configure<SecurityOptions>(defaultOptions);
                }
                else {
                    services.Configure<SecurityOptions>(configOptions);
                }
            }

            services.Configure<ProtectedModuleOptions>(m =>
            {
                m.Items.Add(new ModuleDetails
                {
                    Name = "Jhoose.Security"
                });
            });


            services.AddScoped<ICspPolicyRepository, StandardCspPolicyRepository>();
            services.AddScoped<ICspProvider, StandardCspProvider>();
            services.AddSingleton<ICacheManager, EpiserverCacheManager>();

            return services;
        }

        public static IApplicationBuilder UseJhooseSecurity(this IApplicationBuilder applicationBuilder)
        {
            var securityOptions = applicationBuilder.ApplicationServices.GetService<IOptions<SecurityOptions>>();
            
            applicationBuilder = applicationBuilder.UseWhen(c => IsValidPath(c, securityOptions.Value.ExclusionPaths), ab =>
            {
                ab = ab.UseMiddleware<ContentSecurityPolicyMiddleware>();
                ab.UseMiddleware<SecurityHeadersMiddleware>();
            });

            if (securityOptions.Value.HttpsRedirection)
            {
                applicationBuilder.UseHttpsRedirection();
            }
            
            return applicationBuilder;
        }


        public static bool IsValidPath(HttpContext context, IEnumerable<string> exclusionPaths)
        {

            foreach (var path in exclusionPaths)
            {
                if (context.Request.Path.StartsWithSegments(path, System.StringComparison.InvariantCultureIgnoreCase))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
