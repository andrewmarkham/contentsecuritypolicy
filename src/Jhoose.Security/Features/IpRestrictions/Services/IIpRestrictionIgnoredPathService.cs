using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Features.IpRestrictions.Services;

/// <summary>
/// Determines whether a request path is exempt from the IP restriction allow-list check.
/// </summary>
public interface IIpRestrictionIgnoredPathService
{
    /// <summary>
    /// Returns true if the request path matches an ignored-path entry effective for the site
    /// (global entries union'd with entries scoped to this site).
    /// </summary>
    bool IsIgnored(string siteId, HttpRequest request);
}
