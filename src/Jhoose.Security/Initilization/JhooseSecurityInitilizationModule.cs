#if NET461_OR_GREATER

using EPiServer.Enterprise;
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
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace Jhoose.Security.Initilization
{
    [InitializableModule]
    //[ModuleDependency(typeof(EPiServer.Personalization.VisitorGroups.VisitorGroupInitialization))]
    [ModuleDependency(typeof(FrameworkInitialization))]
    public class JhooseSecurityInitilizationModule : IConfigurableModule
    {
        private bool _eventAttached;
        private ICspProvider cspProvider;

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

            //this.cspProvider = context.StructureMap().GetInstance<ICspProvider>();
            
        }

        public void Initialize(InitializationEngine context)
        {
            //if (!_eventAttached)
            //{
                
                _eventAttached = true;

                //context.InitComplete += Context_InitComplete;

                // Enable Web API routing
                GlobalConfiguration.Configure(config =>
                {
                    

                    // Attribute routing
                    config.MapHttpAttributeRoutes();

                    var formatters = GlobalConfiguration.Configuration.Formatters;
                    var jsonFormatter = formatters.JsonFormatter;
                    var settings = jsonFormatter.SerializerSettings;

                    var enumConverter = new Newtonsoft.Json.Converters.StringEnumConverter();
                    jsonFormatter.SerializerSettings.Converters.Add(enumConverter);

                    settings.Formatting = Formatting.Indented;
                    jsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

                    config.Formatters.Remove(config.Formatters.XmlFormatter);
                    //config.Formatters.Add(jsonFormatter);

                    config.Routes.MapHttpRoute(
                        name: "JhooseSecurityApi",
                        routeTemplate: "api/{controller}/{id}",
                        defaults: new { id = RouteParameter.Optional });

                    config.EnsureInitialized();
                });
            //}
        }

        private void Context_InitComplete(object sender, EventArgs e)
        {
            //this.cspProvider?.Initialize();
        }

        public void Uninitialize(InitializationEngine context)
        {
        }
    }
}
#endif
