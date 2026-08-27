using alloy13preview.Models.Pages;
using alloy13preview.Models.ViewModels;

using EPiServer.Applications;

using EPiServer.Web.Mvc;

using Microsoft.AspNetCore.Mvc;

namespace alloy13preview.Controllers;

public class StartPageController : PageControllerBase<StartPage>
{
    private readonly IApplicationResolver _applicationResolver;

    public StartPageController(IApplicationResolver applicationResolver)
    {
        _applicationResolver = applicationResolver;
    }
    public async Task<IActionResult> Index(StartPage currentPage, CancellationToken cancellationToken)
    {
        var model = PageViewModel.Create(currentPage);
        var application = await _applicationResolver.GetByContextAsync(cancellationToken);

        var website = application as InProcessWebsite;
        // Check if it is the StartPage or just a page of the StartPage type.
        if (website is not null && website.EntryPoint.CompareToIgnoreWorkID(currentPage.ContentLink))
        {
            // Connect the view models logotype property to the start page's to make it editable
            var editHints = ViewData.GetEditHints<PageViewModel<StartPage>, StartPage>();
            editHints.AddConnection(m => m.Layout.Logotype, p => p.SiteLogotype);
            editHints.AddConnection(m => m.Layout.ProductPages, p => p.ProductPageLinks);
            editHints.AddConnection(m => m.Layout.CompanyInformationPages, p => p.CompanyInformationPageLinks);
            editHints.AddConnection(m => m.Layout.NewsPages, p => p.NewsPageLinks);
            editHints.AddConnection(m => m.Layout.CustomerZonePages, p => p.CustomerZonePageLinks);
        }

        return View(model);
    }
}
