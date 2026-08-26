using System.Collections.Generic;

namespace Jhoose.Security.Features.IpRestrictions.Models;

/// <summary>
/// A request to add multiple IP restriction ignored paths at once, e.g. from a pasted block of paths.
/// </summary>
/// <param name="Site">The site to scope the new entries to ("*" for global).</param>
/// <param name="Values">The raw path prefixes to add.</param>
public record BulkIpRestrictionIgnoredPathRequest(string Site, List<string> Values);

/// <summary>
/// The result of a bulk add: the entries that were successfully created, and any raw values that failed validation.
/// </summary>
public record BulkIpRestrictionIgnoredPathResult(List<IpRestrictionIgnoredPath> Created, List<string> Rejected);
