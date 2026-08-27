using System;

using Jhoose.Security.Features.Core.Model;

namespace Jhoose.Security.Features.IpRestrictions.Models;

/// <summary>
/// A single IPv4/IPv6 address or CIDR range on the IP restriction allow-list.
/// </summary>
public record IpRestrictionEntry : ISitePolicy
{
    public IpRestrictionEntry()
    {
    }

    public IpRestrictionEntry(Guid id, string value, string site)
    {
        this.Id = id;
        this.Value = value;
        this.Site = site;
    }

    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// The raw address or CIDR range, e.g. "203.0.113.5" or "2001:db8::/32".
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
