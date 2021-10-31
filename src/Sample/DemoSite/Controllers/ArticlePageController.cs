using DemoSite.Models.Pages;
using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace DemoSite.Controllers
{
    public class ArticlePageController : PageController<ArticlePage>
    {
        private readonly ILogger<ArticlePageController> _logger;

        public ArticlePageController(ILogger<ArticlePageController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index(ArticlePage currentPage)
        {
            return View(currentPage);
        }
    }
}
