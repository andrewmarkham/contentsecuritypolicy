using System.Linq;

namespace Jhoose.Security.Features.IpRestrictions;

/// <summary>
/// Validates header name/value pairs entered as IP restriction ignore-header entries.
/// </summary>
public static class IpRestrictionHeaderValidator
{
    private const string AllowedTokenSymbols = "!#$%&'*+-.^_`|~";

    /// <summary>
    /// Returns true if the header name is a non-empty valid HTTP token (RFC 7230) and the header
    /// value is non-empty and contains no carriage-return or line-feed characters.
    /// </summary>
    public static bool IsValid(string? headerName, string? headerValue)
    {
        return IsValidHeaderName(headerName) && IsValidHeaderValue(headerValue);
    }

    private static bool IsValidHeaderName(string? headerName)
    {
        if (string.IsNullOrWhiteSpace(headerName))
        {
            return false;
        }

        var trimmed = headerName.Trim();

        return trimmed.All(c => char.IsAsciiLetterOrDigit(c) || AllowedTokenSymbols.Contains(c));
    }

    private static bool IsValidHeaderValue(string? headerValue)
    {
        if (string.IsNullOrWhiteSpace(headerValue))
        {
            return false;
        }

        return !headerValue.Contains('\r') && !headerValue.Contains('\n');
    }
}
