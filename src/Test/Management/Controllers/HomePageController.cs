using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using EpiserverAdmin.Models;
using EPiServer;
using Test.ContentDomain.Models.Pages;
using EPiServer.Web.Mvc;
using EPiServer.Core;
using Management;

namespace EpiserverAdmin.Controllers
{
    public class HomePageController : PageController<HomePage>
    {
        private readonly ILogger<HomePageController> _logger;
        private readonly IContentRepository contentRepository;
        
        public HomePageController(ILogger<HomePageController> logger, IContentRepository contentRepository)
        {
            _logger = logger;
            this.contentRepository = contentRepository;
        }

        public IActionResult Index(HomePage currentPage)
        {      
            var vm = new PageViewModel<HomePage>(currentPage);
            
            return View(currentPage);
        }
    }
}
