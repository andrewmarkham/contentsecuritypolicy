using System;
using System.Collections.Generic;
using System.Linq;

using EPiServer.Authorization;
using EPiServer.ServiceLocation;
using EPiServer.Shell.Modules;
using Jhoose.Security.Configuration;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Jhoose.Security.Features.Reporting.DependencyInjection;
using Jhoose.Security.Features.CSP.Provider;

using Jhoose.Security.Features.ResponseHeaders.Providers;

using Jhoose.Security.Features.Settings.Repository;
using Jhoose.Security.Features.ResponseHeaders.Binders;
using Jhoose.Security.Features.CSP.Binders;
using Jhoose.Security.Features.Settings.Binders;
using Jhoose.Security.Features.ImportExport.Services;
using Jhoose.Security.Features.ImportExport.Repository;
using Jhoose.Security.Middleware;
using Jhoose.Security.Features.Core.Services;
using Jhoose.Security.Features.Core.Webhooks;
using Jhoose.Security.Features.Core.Cache;
using Jhoose.Security.Features.Api.Authorization;
using Jhoose.Security.Features.Reporting.Database;
using Jhoose.Security.Features.Database;
using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.Permissions.Providers;
using Jhoose.Security.Features.Permissions.Models;
using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.Permissions.Repository;
using Jhoose.Security.Features.ResponseHeaders.Repository;
using Jhoose.Security.Features.CSP.Repository;
using Jhoose.Security.Features.Core.Providers;

namespace Jhoose.Security.DependencyInjection;

public static class SecurityExtensions
{
    private static readonly Action<AuthorizationPolicyBuilder> DefaultPolicy = p => p.RequireRole(Roles.CmsAdmins);

    public static IServiceCollection AddJhooseSecurity(this IServiceCollection services,
            IConfiguration configuration,
            Action<JhooseSecurityOptions>? options = null,
            Action<AuthorizationPolicyBuilder>? configurePolicy = null)
    {
        services.Configure<JhooseSecurityOptions>(configuration.GetSection(JhooseSecurityOptions.JhooseSecurity));

        if (options != null)
        {
            services.PostConfigure<JhooseSecurityOptions>(options);
        }

        services.Configure<ProtectedModuleOptions>(m =>
        {
            m.Items.Add(new ModuleDetails
            {
                Name = "Jhoose.Security"
            });
        });

        services.AddHostedService<JhooseSqlInit>();
        services.AddSingleton<ISqlHelper, SqlHelper>();
        services.AddHttpContextAccessor();

        services.AddScoped<ISecurityRepository<CspPolicy>, ContentSecurityPolicyRepository>();
        services.Intercept<ISecurityRepository<CspPolicy>>((locator, inner) =>
        {
            var cache = locator.GetRequiredService<ICacheManager>();
            return new CachedSecurityRepository<CspPolicy>(inner, cache);
        });

        services.AddKeyedScoped<IHeaderProvider<CspPolicyHeaderBase>, StandardCspProvider>("csp");

        services.AddScoped<INonceService, NonceService>();
        services.AddScoped<ISettingsRepository, SettingsRepository>();

        services.AddSingleton<ICacheManager, EpiserverCacheManager>();
        services.AddScoped<IJhooseSecurityService, JhooseSecurityService>();

        services.AddScoped<ISecurityRepository<ResponseHeader>, ResponseHeaderRepository>();

        services.Intercept<ISecurityRepository<ResponseHeader>>((locator, inner) =>
        {
            var cache = locator.GetRequiredService<ICacheManager>();
            return new CachedSecurityRepository<ResponseHeader>(inner, cache);
        });

        services.AddScoped<IAuthKeyService, DefaultAuthKeyService>();
        services.AddScoped<IImportExportService, ImportExportService>();


        services.AddScoped<ISecurityRepository<PermissionPolicy>, PermissionsPolicyRepository>();
        services.Intercept<ISecurityRepository<PermissionPolicy>>((locator, inner) =>
        {
            var cache = locator.GetRequiredService<ICacheManager>();
            return new CachedSecurityRepository<PermissionPolicy>(inner, cache);
        });

        services.AddKeyedScoped<IHeaderProvider<ResponseHeader>, StandardPermissionsProvider>("permissions");
        services.AddScoped<ISiteService, SiteService>();

        services.AddScoped<IImportRepository, JhooseImportRepository>();

        services.AddKeyedScoped<IHeaderProvider<ResponseHeader>>("responseHeaders",(sp, key) =>
        {
            var options = sp.GetService<IOptions<JhooseSecurityOptions>>();
            var repo = sp.GetService<ISecurityRepository<ResponseHeader>>();

            if (options is null) throw new ArgumentNullException($"{nameof(options)} is null");
            if (repo is null) throw new ArgumentNullException($"{nameof(repo)} is null");

            return (options?.Value?.UseHeadersUI ?? false) ?
                new StandardResponseHeadersProvider(repo) :
                new ConfigurationResponseHeadersProvider(options);

        });

        //hook in the csp nonce generation to the optimizely internal services, so the same value is always used
        services.AddContentSecurityPolicyNonce(sp => sp.GetRequiredService<INonceService>().GenerateNonce());

        services.AddControllers(options =>
        {
            options.ModelBinderProviders.Insert(0, new ResponseHeaderModelBinderProvider());
            options.ModelBinderProviders.Insert(0, new CspPolicyModelBinderProvider());
            options.ModelBinderProviders.Insert(0, new CspSettingsModelBinderProvider());
        });

        services.AddAuthorization(c =>
        {
            c.AddPolicy(Constants.Authentication.PolicyName, configurePolicy ?? DefaultPolicy);
        });

        services.AddScoped<IWebhookNotifications, DefaultWebhookNotifications>();

        services.AddHttpClient("webhooks");

        //move into main jhoose
        services.AddJhooseSecurityCoreReporting();

        return services;
    }

    public static IApplicationBuilder UseJhooseSecurity(this IApplicationBuilder applicationBuilder)
    {
        var securityOptions = applicationBuilder.ApplicationServices.GetService<IOptions<JhooseSecurityOptions>>();

        applicationBuilder = applicationBuilder.UseWhen(c => IsValidPath(c.Request, securityOptions?.Value.ExclusionPaths ?? Enumerable.Empty<string>()), ab =>
        {
            ab = ab.UseMiddleware<ContentSecurityPolicyMiddleware>();
            ab = ab.UseMiddleware<SecurityHeadersMiddleware>();
            ab = ab.UseMiddleware<PermissionsPolicyMiddleware>();
        });

        if (securityOptions?.Value.HttpsRedirection ?? false)
        {
            applicationBuilder.UseHttpsRedirection();
        }

        applicationBuilder.UseJhooseSecurityReporting();

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
