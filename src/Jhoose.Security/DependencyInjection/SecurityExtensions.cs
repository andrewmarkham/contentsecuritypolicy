#if NET5_0_OR_GREATER
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using Jhoose.Security.Middleware;
using EPiServer.Shell.Modules;
#endif

using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Repository;

using System.Collections.Generic;

using System;
using Jhoose.Security.Core.Cache;

using Jhoose.Security.Services;
using System.Web;

namespace Jhoose.Security.DependencyInjection
{
    public static class SecurityExtensions
    {
#if NET5_0_OR_GREATER

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
            services.AddScoped<IJhooseSecurityService, JhooseSecurityService>();

            //hook in the csp nonce generation to the optimizely internal services, so the same value is always used
            services.AddContentSecurityPolicyNonce(sp => sp.GetRequiredService<ICspProvider>().GenerateNonce());

            return services;
        }

        public static IApplicationBuilder UseJhooseSecurity(this IApplicationBuilder applicationBuilder)
        {
            var securityOptions = applicationBuilder.ApplicationServices.GetService<IOptions<JhooseSecurityOptions>>();

            applicationBuilder = applicationBuilder.UseWhen(c => IsValidPath(c.Request, securityOptions.Value.ExclusionPaths), ab =>
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
#endif

        public static bool IsValidPath(HttpRequest request, IEnumerable<string> exclusionPaths)
        {

            foreach (var path in exclusionPaths)
            {
#if NET5_0_OR_GREATER
                if (request.Path.StartsWithSegments(path, System.StringComparison.InvariantCultureIgnoreCase))
                {
                    return false;
                }
#else
                if (request.Path.StartsWith(path, System.StringComparison.InvariantCultureIgnoreCase))
                {
                    return false;
                }
#endif
            }

            return true;
        }
    }
}
