using alloy13preview.Extensions;

using EPiServer.Cms.UI.AspNetIdentity;
using EPiServer.Data;
using EPiServer.DependencyInjection;
using EPiServer.Scheduler;

using EPiServer.Web.Routing;

using Jhoose.Security.DependencyInjection;

using Optimizely.Graph.DependencyInjection;

namespace alloy13preview;

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
            AppDomain.CurrentDomain.SetData("DataDirectory", Path.Combine(_webHostingEnvironment.ContentRootPath, "App_Data"));

            services.Configure<SchedulerOptions>(options => options.Enabled = false);
        }

        services
            .AddCmsAspNetIdentity<ApplicationUser>()
            .AddCms()
            .AddAlloy()
            .AddAdminUserRegistration()
            .AddEmbeddedLocalization<Startup>();

        services.AddContentGraph();
        services.AddContentManager();

        //services.AddVisitorGroups();
        
        // Required by Wangkanai.Detection
        services.AddDetection();

        services.AddSession(options =>
        {
            options.IdleTimeout = TimeSpan.FromSeconds(10);
            options.Cookie.HttpOnly = true;
            options.Cookie.IsEssential = true;
        });

        services.Configure<DataAccessOptions>(options =>
        {
            options.UpdateDatabaseCompatibilityLevel = true;
        });

        services.AddJhooseSecurity(_configuration,(o) =>
        {
            o.UseHeadersUI = true;
            o.ExclusionPaths.Add("/Episerver");

            o.ExclusionPaths.Add("/Optimizely"); // if remove this get a serialization error when accessing the admin UI
            o.Reporting.RateLimiting.Enabled = false;
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        // Required by Wangkanai.Detection
        app.UseDetection();
        app.UseSession();

        app.UseStaticFiles();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();

        app.UseJhooseSecurity();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapContent();
        });
    }
}
