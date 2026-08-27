using alloy13preview.Business;
using alloy13preview.Models.Pages;
using alloy13preview.Models.ViewModels;
using EPiServer.Applications;
using EPiServer.Framework.DataAnnotations;
using EPiServer.Framework.Web;
using EPiServer.Framework.Web.Mvc;
using EPiServer.Web;
using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Mvc;

namespace alloy13preview.Controllers;

// Note: as the content area rendering on Alloy is customized we create ContentArea instances
// which we render in the preview view in order to provide editors with a preview which is as
// realistic as possible. In other contexts we could simply have passed the block to the
// view and rendered it using Html.RenderContentData
[TemplateDescriptor(
    Inherited = true,
    TemplateTypeCategory = TemplateTypeCategories.MvcController, //Required as controllers for blocks are registered as MvcPartialController by default
    Tags = [RenderingTags.Preview, RenderingTags.Edit],
    AvailableWithoutTag = false)]
[VisitorGroupImpersonation]
[RequireClientResources]
public class PreviewController : ActionControllerBase, IRenderTemplate<BlockData>, IModifyLayout
{
    private readonly IContentLoader _contentLoader;
    private readonly TemplateResolver _templateResolver;
    private readonly DisplayOptions _displayOptions;
    private readonly IApplicationResolver applicationResolver;

    public PreviewController(IContentLoader contentLoader, TemplateResolver templateResolver, DisplayOptions displayOptions,IApplicationResolver applicationResolver)
    {
        _contentLoader = contentLoader;
        _templateResolver = templateResolver;
        _displayOptions = displayOptions;
        this.applicationResolver = applicationResolver;
    }

    public IActionResult Index(IContent currentContent)
    {
        //As the layout requires a page for title etc we "borrow" the start page
        var website = this.applicationResolver.GetByContent(currentContent.ContentLink, true) as InProcessWebsite;
        var startPage = _contentLoader.Get<StartPage>(website.EntryPoint);

        var model = new PreviewModel(startPage, currentContent);

        var supportedDisplayOptions = _displayOptions
            .Select(x => new { x.Tag, x.Name, Supported = SupportsTag(currentContent, x.Tag) })
            .ToList();

        if (supportedDisplayOptions.Any(x => x.Supported))
        {
            foreach (var displayOption in supportedDisplayOptions)
            {
                var contentArea = new ContentArea();

                contentArea.Items.Add(new ContentAreaItem
                {
                    ContentLink = currentContent.ContentLink
                });

                var areaModel = new PreviewModel.PreviewArea
                {
                    Supported = displayOption.Supported,
                    AreaTag = displayOption.Tag,
                    AreaName = displayOption.Name,
                    ContentArea = contentArea
                };

                model.Areas.Add(areaModel);
            }
        }

        return View(model);
    }

    private bool SupportsTag(IContent content, string tag)
    {
        var templateModel = _templateResolver.Resolve(
            HttpContext,
            content.GetOriginalType(),
            content,
            TemplateTypeCategories.MvcPartial,
            tag);

        return templateModel != null;
    }

    public void ModifyLayout(LayoutModel layoutModel)
    {
        layoutModel.HideHeader = true;
        layoutModel.HideFooter = true;
    }
}
