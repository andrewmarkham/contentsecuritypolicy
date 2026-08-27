using System;
using System.Collections.Generic;
using System.Linq;

using Jhoose.Security.Features.Core.Model;
using Jhoose.Security.Features.ResponseHeaders.Models;


namespace Jhoose.Security.Features.Core.Providers;

public abstract class HeaderProviderBase<T> : IHeaderProvider<T> where T : ResponseHeader
{
    public abstract IEnumerable<T> Headers(string siteId, string host);

    // Must be declared here (not just on IHeaderProvider<T>) so it's a real virtual member that
    // StandardCspProvider can override. HeaderProviderBase<T> is the class that directly declares
    // ": IHeaderProvider<T>", so only members it declares participate in the interface's virtual
    // dispatch for subclasses - a subclass method that merely matches the interface's default-method
    // signature does NOT get called when invoked through an IHeaderProvider<T>-typed reference; the
    // interface's own default implementation wins instead, silently discarding contentLink.
    public virtual IEnumerable<T> Headers(string siteId, string host, string contentLink) => Headers(siteId, host);

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

    public List<TP> MergePolicies<TP>(string siteId, string contentLink, List<TP> policies) where TP : ISitePolicy, IContentPolicy
    {
        var siteIds = new[] { siteId, "*", string.Empty };

        var candidates = policies
            .Where(p => siteIds.Any(s => p.Site.Equals(s, StringComparison.InvariantCultureIgnoreCase)))
            .Where(p => string.IsNullOrEmpty(p.ContentLink) || p.ContentLink.Equals(contentLink, StringComparison.InvariantCultureIgnoreCase))
            .ToList();

        return candidates
            .GroupBy(p => p.GroupingKey)
            .Select(g =>
                g.FirstOrDefault(p => !string.IsNullOrEmpty(p.ContentLink))
                ?? g.FirstOrDefault(p => p.Site.Equals(siteId, StringComparison.InvariantCultureIgnoreCase))
                ?? g.First())
            .ToList();
    }
}