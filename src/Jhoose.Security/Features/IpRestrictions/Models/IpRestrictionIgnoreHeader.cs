using System;

using Jhoose.Security.Features.Core.Model;

namespace Jhoose.Security.Features.IpRestrictions.Models;

/// <summary>
/// A header name/value pair that, when present on a request, exempts it from the IP restriction allow-list check.
/// </summary>
public record IpRestrictionIgnoreHeader : ISitePolicy
{
    public IpRestrictionIgnoreHeader()
    {
    }

    public IpRestrictionIgnoreHeader(Guid id, string headerName, string headerValue, string site)
    {
        this.Id = id;
        this.HeaderName = headerName;
        this.HeaderValue = headerValue;
        this.Site = site;
    }

    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// The header name to match, e.g. "X-Internal-Bypass".
    /// </summary>
    public string HeaderName { get; set; } = string.Empty;

    /// <summary>
    /// The header value that must match (case-insensitive) for the request to be exempted.
    /// </summary>
    public string HeaderValue { get; set; } = string.Empty;

    private string site = "*";

    public string Site
    {
        get => site;
        set => site = string.IsNullOrEmpty(value) ? "*" : value;
    }

    public string GroupingKey => this.Id.ToString();
}
