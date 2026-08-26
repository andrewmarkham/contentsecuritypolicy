using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Features.IpRestrictions.Services;

/// <summary>
/// Determines whether a request carries a header exempting it from the IP restriction allow-list check.
/// </summary>
public interface IIpRestrictionIgnoreHeaderService
{
    /// <summary>
    /// Returns true if the request has a header matching an ignore-header entry effective for the site
    /// (global entries union'd with entries scoped to this site).
    /// </summary>
    bool IsIgnored(string siteId, HttpRequest request);
}
