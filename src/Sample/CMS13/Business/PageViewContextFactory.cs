using alloy13preview.Models.Pages;
using alloy13preview.Models.ViewModels;
using EPiServer.Applications;
using EPiServer.Data;
using EPiServer.ServiceLocation;
using EPiServer.Web;
using EPiServer.Web.Routing;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace alloy13preview.Business;

[ServiceConfiguration]
public class PageViewContextFactory
{
    private readonly IContentLoader _contentLoader;
    private readonly UrlResolver _urlResolver;
    private readonly IDatabaseMode _databaseMode;
    private readonly IApplicationResolver applicationResolver;
    private readonly CookieAuthenticationOptions _cookieAuthenticationOptions;

    public PageViewContextFactory(
        IContentLoader contentLoader,
        UrlResolver urlResolver,
        IDatabaseMode databaseMode,
        IOptionsMonitor<CookieAuthenticationOptions> optionMonitor,
        IApplicationResolver applicationResolver)
    {
        _contentLoader = contentLoader;
        _urlResolver = urlResolver;
        _databaseMode = databaseMode;
        this.applicationResolver = applicationResolver;
        _cookieAuthenticationOptions = optionMonitor.Get(IdentityConstants.ApplicationScheme);
    }

    public virtual LayoutModel CreateLayoutModel(ContentReference currentContentLink, HttpContext httpContext)
    {
        var website = this.applicationResolver.GetByContent(currentContentLink, true) as Website;
        var startPageContentLink = website.RoutingEntryPoint;

        // Use the content link with version information when editing the startpage,
        // otherwise the published version will be used when rendering the props below.
        if (currentContentLink.CompareToIgnoreWorkID(startPageContentLink))
        {
            startPageContentLink = currentContentLink;
        }

        var startPage = _contentLoader.Get<StartPage>(startPageContentLink);

        return new LayoutModel
        {
            Logotype = startPage.SiteLogotype,
            LogotypeLinkUrl = new HtmlString(_urlResolver.GetUrl(startPageContentLink)),
            ProductPages = startPage.ProductPageLinks,
            CompanyInformationPages = startPage.CompanyInformationPageLinks,
            NewsPages = startPage.NewsPageLinks,
            CustomerZonePages = startPage.CustomerZonePageLinks,
            LoggedIn = httpContext.User.Identity.IsAuthenticated,
            LoginUrl = new HtmlString(GetLoginUrl(currentContentLink)),
            SearchActionUrl = new HtmlString(UrlResolver.Current.GetUrl(startPage.SearchPageLink)),
            IsInReadonlyMode = _databaseMode.DatabaseMode == DatabaseMode.ReadOnly
        };
    }

    private string GetLoginUrl(ContentReference returnToContentLink)
    {
        return $"{_cookieAuthenticationOptions?.LoginPath.Value ?? Globals.LoginPath}?ReturnUrl={_urlResolver.GetUrl(returnToContentLink)}";
    }

    public virtual IContent GetSection(ContentReference contentLink)
    {
        var website = this.applicationResolver.GetByContent(contentLink, true) as Website;
        var startPageContentLink = website.RoutingEntryPoint;

        var currentContent = _contentLoader.Get<IContent>(contentLink);

        bool isSectionRoot(ContentReference contentReference) =>
           ContentReference.IsNullOrEmpty(contentReference) ||
           contentReference.Equals(startPageContentLink) ||
           contentReference.Equals(ContentReference.RootPage);

        if (isSectionRoot(currentContent.ParentLink))
        {
            return currentContent;
        }

        return _contentLoader.GetAncestors(contentLink)
            .OfType<PageData>()
            .SkipWhile(x => !isSectionRoot(x.ParentLink))
            .FirstOrDefault();
    }
}
