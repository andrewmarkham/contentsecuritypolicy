using System;
using System.Collections.Generic;
using System.Linq;

using Jhoose.Security.Features.Core.Model;
using Jhoose.Security.Features.ResponseHeaders.Models;


namespace Jhoose.Security.Features.Core.Providers;

public abstract class HeaderProviderBase<T> : IHeaderProvider<T> where T : ResponseHeader
{
    public abstract IEnumerable<T> Headers(string siteId, string host);

    public List<TP> MergePolicies<TP>(string siteId, List<TP> policies) where TP : ISitePolicy
    {
        var siteIds = new[] {siteId, "*", string.Empty };

        var mergedPolicies = policies
            .Where(p => siteIds.Any(g => p.Site.Equals(g, StringComparison.InvariantCultureIgnoreCase)))
            .GroupBy(p => p.GroupingKey)
            .Select(g => g.FirstOrDefault(p => p.Site.Equals(siteId, StringComparison.InvariantCultureIgnoreCase)) ?? g.First())
            .ToList();
        return mergedPolicies;
    }
}