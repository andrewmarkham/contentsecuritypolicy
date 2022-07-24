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

        public HomePageController(ILogger<HomePageController> logger,
            IContentRepository contentRepository,
            IClientResourceService clientResourceService)
        {
            _logger = logger;
            this.contentRepository = contentRepository;
            var f = clientResourceService.GetClientResources("Header");
        }

        public IActionResult Index(HomePage currentPage)
        {




            var vm = new PageViewModel<HomePage>(currentPage);

            return View(currentPage);
        }
    }
}
