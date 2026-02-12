using System.Collections.Generic;
using System.Linq;

using EPiServer.Core;
using EPiServer.Web;

using Jhoose.Security.Features.Core.Model;

using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Features.Core.Services;

public class SiteService(ISiteDefinitionResolver siteDefinitionResolver, ISiteDefinitionRepository siteDefinitionRepository) : ISiteService
{
    public IEnumerable<Site> GetSites()
    {
        var sites = siteDefinitionRepository.List()
            .Where(site => site.SiteUrl is not null) // Filter out sites without a URL
            .Select(site => new Site { Id = site.Id.ToString(), Name = site.Name })
            .OrderBy(site => site.Name)
            .ToList();

        return sites;
    }

    public string? ResolveSiteId(HttpResponse response)
    {
        var host = response?.HttpContext?.Request?.Host.Host;

        return ResolveSiteId(host!);
    }
    
    public string? ResolveSiteId(string hostName)
    {
        var siteDefinition = siteDefinitionResolver.GetByHostname(hostName, true, out var hostDefinition);
        return siteDefinition?.Id.ToString();
    }

    public string? ResolveSiteId(ContentReference contentReference)
    {
        var siteDefinition = siteDefinitionResolver.GetByContent(contentReference, true);
        return siteDefinition?.Id.ToString();
    }
}
