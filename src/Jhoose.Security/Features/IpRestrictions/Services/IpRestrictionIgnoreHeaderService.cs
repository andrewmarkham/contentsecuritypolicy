using System;
using System.Linq;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.IpRestrictions.Models;

using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Features.IpRestrictions.Services;

public class IpRestrictionIgnoreHeaderService(
    ISecurityRepository<IpRestrictionIgnoreHeader> ignoreHeaderRepository) : IIpRestrictionIgnoreHeaderService
{
    public bool IsIgnored(string siteId, HttpRequest request)
    {
        var normalizedSiteId = string.IsNullOrWhiteSpace(siteId) ? "*" : siteId.Trim();

        var entries = ignoreHeaderRepository.Load() ?? [];
        var effectiveEntries = entries.Where(e =>
            e.Site.Equals("*", StringComparison.OrdinalIgnoreCase) ||
            e.Site.Equals(normalizedSiteId, StringComparison.OrdinalIgnoreCase));

        foreach (var entry in effectiveEntries)
        {
            if (!request.Headers.TryGetValue(entry.HeaderName, out var values))
            {
                continue;
            }

            if (values.Any(v => string.Equals(v, entry.HeaderValue, StringComparison.OrdinalIgnoreCase)))
            {
                return true;
            }
        }

        return false;
    }
}
