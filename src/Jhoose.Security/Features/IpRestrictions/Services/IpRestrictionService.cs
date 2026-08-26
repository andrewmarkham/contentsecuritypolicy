using System;
using System.Linq;
using System.Net;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.IpRestrictions.Models;
using Jhoose.Security.Features.Settings.Repository;

namespace Jhoose.Security.Features.IpRestrictions.Services;

public class IpRestrictionService(
    ISecurityRepository<IpRestrictionEntry> ipRestrictionRepository,
    ISettingsRepository settingsRepository) : IIpRestrictionService
{
    public bool IsAllowed(string siteId, IPAddress clientIp)
    {
        var settings = settingsRepository.Load();
        if (!settings.IsIpRestrictionEnabledForSite(siteId))
        {
            return true;
        }

        var normalizedSiteId = string.IsNullOrWhiteSpace(siteId) ? "*" : siteId.Trim();

        var entries = ipRestrictionRepository.Load() ?? [];
        var effectiveEntries = entries.Where(e =>
            e.Site.Equals("*", StringComparison.OrdinalIgnoreCase) ||
            e.Site.Equals(normalizedSiteId, StringComparison.OrdinalIgnoreCase));

        foreach (var entry in effectiveEntries)
        {
            if (IpNetworkParser.TryParse(entry.Value, out var network) && network.Contains(clientIp))
            {
                return true;
            }
        }

        return false;
    }
}
