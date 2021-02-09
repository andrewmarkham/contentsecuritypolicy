//using AlloyMvcTemplates.Business.Rendering;
//using AlloyTemplates;
//using AlloyTemplates.Business;
//using AlloyTemplates.Business.Channels;

using EPiServer.Cms.Shell.UI.Approvals.Notifications;
using EPiServer.Web;
using EpiserverAdmin.Filter;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace EpiserverAdmin.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddAlloy(this IServiceCollection services)
        {
            services.Configure<RazorViewEngineOptions>(options =>
            {
                options.ViewLocationExpanders.Add(new SiteViewEngineLocationExpander());
            });


            services.TryAddEnumerable(ServiceDescriptor.Singleton(typeof(IStartupFilter), typeof(AdministratorRegistrationStartupFilter)));
            services.Configure<ApprovalNotificationOptions>(options => options.Immediate = false);
            services.Configure<MvcOptions>(options =>
            {
                //options.Filters.Add<PageContextActionFilter>();
            });

            services.AddDetection();
        }
    }
}