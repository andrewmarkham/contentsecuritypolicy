using DemoSite.Models.Pages;
using DemoSite.Models.ViewModels;
using EPiServer;
using EPiServer.Framework.Web.Resources;
using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace DemoSite.Controllers
{
    public class HomePageController : PageController<HomePage>
    {
        private readonly ILogger<HomePageController> _logger;
        private readonly IContentRepository contentRepository;

        //private readonly BootstrapData bootstrapData;

        public HomePageController(ILogger<HomePageController> logger,
            IContentRepository contentRepository,
            IClientResourceService clientResourceService//,
                                                        //BootstrapData bootstrapData
            )
        {
            _logger = logger;
            this.contentRepository = contentRepository;
            var f = clientResourceService.GetClientResources("Header");

            //this.bootstrapData = bootstrapData;
        }

        public IActionResult Index(HomePage currentPage)
        {
            //this.bootstrapData.Run();

            var vm = new PageViewModel<HomePage>(currentPage);

            return View(currentPage);
        }
    }
}
