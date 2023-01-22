#if NET461_OR_GREATER

using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.ServiceLocation;
using EPiServer.Shell.Modules.Internal;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Core.Repository;
using Jhoose.Security.Repository;
using Jhoose.Security.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Web.Http;

namespace Jhoose.Security.Initilization
{
    [InitializableModule]
    [ModuleDependency(typeof(FrameworkInitialization))]
    public class JhooseSecurityInitilizationModule : IConfigurableModule
    {
        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            var services = context.Services;


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
        }

        public void Initialize(InitializationEngine context)
        {
            // Enable Web API routing
            GlobalConfiguration.Configure(config =>
            {
                // Attribute routing
                config.MapHttpAttributeRoutes();

                /*
                 * Legacy approach
                var formatters = GlobalConfiguration.Configuration.Formatters;
                var jsonFormatter = formatters.JsonFormatter;
                var settings = jsonFormatter.SerializerSettings;

                var enumConverter = new Newtonsoft.Json.Converters.StringEnumConverter();
                jsonFormatter.SerializerSettings.Converters.Add(enumConverter);

                settings.Formatting = Formatting.Indented;
                jsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

                config.Formatters.Remove(config.Formatters.XmlFormatter);
                */

                config.Routes.MapHttpRoute(
                    name: "JhooseSecurityApi",
                    routeTemplate: "api/{controller}/{id}",
                    defaults: new { id = RouteParameter.Optional });

                config.EnsureInitialized();
            });
        }

        private void Context_InitComplete(object sender, EventArgs e)
        {
        }

        public void Uninitialize(InitializationEngine context)
        {
        }
    }
}
#endif
