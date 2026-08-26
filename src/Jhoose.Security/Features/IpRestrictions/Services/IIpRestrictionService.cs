using System.Net;

namespace Jhoose.Security.Features.IpRestrictions.Services;

/// <summary>
/// Determines whether a client IP address is allowed to access a given site under the IP restriction allow-list.
/// </summary>
public interface IIpRestrictionService
{
    /// <summary>
    /// Returns true if IP restrictions are disabled for the site, or the client IP matches an entry
    /// on the effective allow-list (global entries union'd with entries scoped to this site).
    /// </summary>
    bool IsAllowed(string siteId, IPAddress clientIp);
}
