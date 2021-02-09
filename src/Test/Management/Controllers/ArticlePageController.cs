using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using EpiserverAdmin.Models;

using EPiServer.Web;
using EPiServer.Web.Mvc;
using Test.ContentDomain.Models.Pages;

namespace EpiserverAdmin.Controllers
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
