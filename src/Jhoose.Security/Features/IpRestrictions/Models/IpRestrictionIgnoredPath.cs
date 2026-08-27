using System;

using Jhoose.Security.Features.Core.Model;

namespace Jhoose.Security.Features.IpRestrictions.Models;

/// <summary>
/// A URL path prefix exempt from the IP restriction allow-list check.
/// </summary>
public record IpRestrictionIgnoredPath : ISitePolicy
{
    public IpRestrictionIgnoredPath()
    {
    }

    public IpRestrictionIgnoredPath(Guid id, string value, string site)
    {
        this.Id = id;
        this.Value = value;
        this.Site = site;
    }

    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// The path prefix, e.g. "/healthz" or "/webhooks/stripe".
    /// </summary>
    public string Value { get; set; } = string.Empty;

    private string site = "*";

    public string Site
    {
        get => site;
        set => site = string.IsNullOrEmpty(value) ? "*" : value;
    }

    public string GroupingKey => this.Id.ToString();
}
