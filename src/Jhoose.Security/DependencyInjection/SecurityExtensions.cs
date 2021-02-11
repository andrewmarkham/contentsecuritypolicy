using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using EPiServer.Shell.Modules;
using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Repository;
using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.DependencyInjection
{
    public static class SecurityExtensions
    {
        public static IServiceCollection AddJhooseSecurity(this IServiceCollection services){

            services.Configure<ProtectedModuleOptions>(m => {
                m.Items.Add(new ModuleDetails{
                    Name = "Jhoose.Security"
                });
            });
            

            services.AddScoped<ICspPolicyRepository, StandardCspPolicyRepository>();
            services.AddScoped<ICspProvider, StandardCspProvider>();

            return services;
        }
        
        public static IApplicationBuilder UseJhooseSecurity(this IApplicationBuilder applicationBuilder)
        {
            return applicationBuilder.UseWhen(IsValidPath, ab => {
                var provider = ab.ApplicationServices.GetService<ICspProvider>();
                provider.Initialize();
                
                ab.UseMiddleware<SecurityMiddleware>();
            });
        }

        static bool IsValidPath(HttpContext context) 
        {
            //return false;
            return !context.Request.Path.StartsWithSegments("/episerver", System.StringComparison.InvariantCultureIgnoreCase);
        }
    }
}
