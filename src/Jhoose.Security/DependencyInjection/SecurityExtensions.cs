#if NET5_0_OR_GREATER
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
using Jhoose.Security.Middleware;
using Jhoose.Security.Services;

namespace Jhoose.Security.DependencyInjection
{
    public static class SecurityExtensions
    {
        public static IServiceCollection AddJhooseSecurity(this IServiceCollection services, 
                IConfiguration configuration, 
                Action<JhooseSecurityOptions> options = null)
        {
            services.AddHostedService<InitialiseHostedService>();

            if (options != null)
            {
                services.Configure<JhooseSecurityOptions>(options);
            }
            else
            {
                services.Configure<JhooseSecurityOptions>(configuration.GetSection(JhooseSecurityOptions.JhooseSecurity));
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
            services.AddScoped<IJhooseSecurityService,JhooseSecurityService>();

            return services;
        }

        public static IApplicationBuilder UseJhooseSecurity(this IApplicationBuilder applicationBuilder)
        {
            var securityOptions = applicationBuilder.ApplicationServices.GetService<IOptions<JhooseSecurityOptions>>();
            
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
#endif