using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using Jhoose.Security.Middleware;
using EPiServer.Shell.Modules;

using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Repository;

using System.Collections.Generic;

using System;
using Jhoose.Security.Core.Cache;

using Jhoose.Security.Services;
using System.Web;
using Jhoose.Security.Core.Binders;

namespace Jhoose.Security.DependencyInjection
{
    public static class SecurityExtensions
    {
        public static IServiceCollection AddJhooseSecurity(this IServiceCollection services,
                IConfiguration configuration,
                Action<JhooseSecurityOptions>? options = null)
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

            services.AddScoped<IResponseHeadersRepository, StandardResponseHeadersRepository>();

            services.AddScoped<IResponseHeadersProvider>((sp) =>
            {
                var options = sp.GetService<IOptions<JhooseSecurityOptions>>();
                var repo = sp.GetService<IResponseHeadersRepository>();

                if (options is null) throw new ArgumentNullException($"{nameof(options)} is null");
                if (repo is null) throw new ArgumentNullException($"{nameof(repo)} is null");

                return (options?.Value?.UseHeadersUI ?? false) ?
                    new StandardResponseHeadersProvider(repo) :
                    new ConfigurationResponseHeadersProvider(options);

            });

            //hook in the csp nonce generation to the optimizely internal services, so the same value is always used
            services.AddContentSecurityPolicyNonce(sp => sp.GetRequiredService<ICspProvider>().GenerateNonce());

            services.AddControllers(options =>
            {
                options.ModelBinderProviders.Insert(0, new ResponseHeaderModelBinderProvider());
            });

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

        public static bool IsValidPath(HttpRequest request, IEnumerable<string> exclusionPaths)
        {

            foreach (var path in exclusionPaths)
            {
                if (request.Path.StartsWithSegments(path, System.StringComparison.InvariantCultureIgnoreCase))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
