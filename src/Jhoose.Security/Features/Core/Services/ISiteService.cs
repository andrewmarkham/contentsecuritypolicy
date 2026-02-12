using System.Collections.Generic;

using EPiServer.Core;

using Jhoose.Security.Features.Core.Model;

using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Features.Core.Services;

public interface ISiteService
{
    IEnumerable<Site> GetSites();
    string? ResolveSiteId(HttpResponse response);
    string? ResolveSiteId(string hostName);
    string? ResolveSiteId(ContentReference contentReference);
}
