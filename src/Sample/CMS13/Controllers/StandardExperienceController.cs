using alloy13preview.Models.Experiences;
using alloy13preview.Models.ViewModels;

using EPiServer.Applications;

using EPiServer.Web.Mvc;

using Microsoft.AspNetCore.Mvc;

namespace alloy13preview.Controllers;

public class StandardExperienceController : PageController<StandardExperience>
{
    private readonly IApplicationResolver _applicationResolver;

    public StandardExperienceController(IApplicationResolver _applicationResolver  ) : base()
    {
        this._applicationResolver = _applicationResolver;
    }
    public IActionResult Index(StandardExperience currentPage)
    {
         var model = PageViewModel.Create(currentPage);
        return View(model);
    }
}