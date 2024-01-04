using DemoSite.Infrastructure.Initilization;
using EPiServer.Cms.UI.AspNetIdentity;
using EPiServer.Web;
using EPiServer.Web.Routing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Jhoose.Security.DependencyInjection;
using Microsoft.Extensions.Configuration;
using EPiServer.Framework.Web.Resources;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DemoSite
{
    public class Startup
    {
        private readonly IWebHostEnvironment _webHostingEnvironment;
        private readonly IConfiguration _configuration;

        public Startup(IWebHostEnvironment webHostingEnvironment, IConfiguration configuration)
        {
            _webHostingEnvironment = webHostingEnvironment;
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            if (_webHostingEnvironment.IsDevelopment())
            {
                //Add development configuration
            }

            services.AddMvc();
            services.AddCms()
                .AddCmsAspNetIdentity<ApplicationUser>();


            services.Configure<ClientResourceOptions>(o =>
            {
                o.Debug = true;
            });


            services.TryAddEnumerable(ServiceDescriptor.Singleton(typeof(IFirstRequestInitializer), typeof(BootstrapAdminUser)));

            services.AddJhooseSecurity(_configuration, (o) =>
            {
                o.UseHeadersUI = true;
            },
            configurePolicy: (p) =>
            {
                p.RequireRole("CspAdmin");
            });

            services.ConfigureApplicationCookie(options =>
            {
                options.LoginPath = "/util/Login";
            });


            services.AddControllers().AddJsonOptions(options =>
            {
                // Global settings: use the defaults, but serialize enums as strings
                // (because it really should be the default)
                //options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                //options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.KebabCaseUpper;

            });

            //services.AddTransient<BootstrapData, BootstrapData>();
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseJhooseSecurity();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapContent();
                endpoints.MapControllers();
            });

        }
    }
}
