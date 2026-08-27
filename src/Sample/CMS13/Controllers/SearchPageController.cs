using alloy13preview.Models.Pages;
using alloy13preview.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;

using Optimizely.Graph.Cms.Query;

namespace alloy13preview.Controllers;

public class SearchPageController(IGraphContentClient client) : PageControllerBase<SearchPage>
{
    public async Task<ViewResult> Index(SearchPage currentPage, string q)
    {
        var model = new SearchContentModel(currentPage)
        {
            Hits = Enumerable.Empty<SearchContentModel.SearchHit>(),
            NumberOfHits = 0,
            SearchServiceDisabled = true,
            SearchedQuery = q
        };

        var results = await client.QueryContent<SitePageData>()
            .SearchFor(q)
            .UsingFullText()
            .Limit(10)
            .Skip(0)
            .GetAsContentAsync();

        return View(model);
    }
}
