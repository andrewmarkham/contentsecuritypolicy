using System;
using System.Linq;

using Jhoose.Security.DependencyInjection;
using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.IpRestrictions.Models;

using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Features.IpRestrictions.Services;

public class IpRestrictionIgnoredPathService(
    ISecurityRepository<IpRestrictionIgnoredPath> ignoredPathRepository) : IIpRestrictionIgnoredPathService
{
    public bool IsIgnored(string siteId, HttpRequest request)
    {
        var normalizedSiteId = string.IsNullOrWhiteSpace(siteId) ? "*" : siteId.Trim();

        var entries = ignoredPathRepository.Load() ?? [];
        var effectivePaths = entries
            .Where(e =>
                e.Site.Equals("*", StringComparison.OrdinalIgnoreCase) ||
                e.Site.Equals(normalizedSiteId, StringComparison.OrdinalIgnoreCase))
            .Select(e => e.Value);

        return !SecurityExtensions.IsValidPath(request, effectivePaths);
    }
}
