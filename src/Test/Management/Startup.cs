using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using EPiServer;
using EPiServer.Cms.UI.AspNetIdentity;
using EPiServer.Data;
using EPiServer.DependencyInjection;
using EPiServer.Framework.Web.Resources;
using EPiServer.Web.Internal;
using EPiServer.Web.Routing;
using EpiserverAdmin.Extensions;
using EpiserverAdmin.Filter;
using Jhoose.Security.Admin.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Test.ContentDomain;

namespace EpiserverAdmin
{
    public class Startup
    {        private readonly IWebHostEnvironment _webHostingEnvironment;
        private readonly IConfiguration _configuration;

        public Startup(IWebHostEnvironment webHostingEnvironment, IConfiguration configuration)
        {
            _webHostingEnvironment = webHostingEnvironment;
            _configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            //var dbPath = Path.Combine(_webHostingEnvironment.ContentRootPath, "App_Data\\Alloy.mdf");
            var connectionstring = _configuration.GetConnectionString("EPiServerDB") ?? $"Server=tcp:jhoose-epi.database.windows.net,1433;Initial Catalog=Epi12-test;Persist Security Info=False;User ID=amarkham;Password=Hyperion2!;MultipleActiveResultSets=True;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

            services.Configure<DataAccessOptions>(o =>
            {
                o.SetConnectionString(connectionstring);
            });

            services.Configure<ClientResourceOptions>(o => 
            {
                o.Debug = true;
            });

            services.AddCmsAspNetIdentity<ApplicationUser>(o =>
            {
                if (string.IsNullOrEmpty(o.ConnectionStringOptions?.ConnectionString))
                {
                    o.ConnectionStringOptions = new ConnectionStringOptions()
                    {
                        ConnectionString = connectionstring
                    };
                }
            });


            services.AddMvc();
            services.AddAlloy();
            services.AddCms();

            services.AddSecurity();

            services.ConfigureApplicationCookie(options =>
            {
                options.LoginPath = "/Login";
            });

            services.Configure<UIOptions>(uiOptions =>
            {
                uiOptions.UIShowGlobalizationUserInterface = true;
            });

            //services.AddControllersWithViews();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseContentSecuriyPolicy();
            
            app.UseEndpoints(endpoints =>
            {

                endpoints.MapContent();
                endpoints.MapControllerRoute("Register", "/Register", new { controller = "Register", action = "Index" });
                endpoints.MapRazorPages();

                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");

            });
        }
    }
}
