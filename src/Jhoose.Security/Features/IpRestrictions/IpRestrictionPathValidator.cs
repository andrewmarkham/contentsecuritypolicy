using System.Linq;

namespace Jhoose.Security.Features.IpRestrictions;

/// <summary>
/// Validates path prefixes entered as IP restriction ignored paths.
/// </summary>
public static class IpRestrictionPathValidator
{
    /// <summary>
    /// Returns true if the value is a non-empty, app-relative path prefix starting with '/',
    /// containing no whitespace, '?' or '#'.
    /// </summary>
    public static bool IsValid(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var trimmed = value.Trim();

        return trimmed.StartsWith('/')
            && !trimmed.Any(char.IsWhiteSpace)
            && !trimmed.Contains('?')
            && !trimmed.Contains('#');
    }
}
