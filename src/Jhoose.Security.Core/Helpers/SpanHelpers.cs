using System;

namespace Jhoose.Security.Core.Helpers;

/// <summary>
/// Span-based helper methods for high-performance string processing in CSP contexts
/// </summary>
public static class SpanHelpers
{
    /// <summary>
    /// Efficiently checks if a URL domain matches any of the allowed domains using Span
    /// </summary>
    /// <param name="url">The URL to check</param>
    /// <param name="allowedDomains">Comma-separated list of allowed domains</param>
    /// <returns>True if the URL domain is allowed</returns>
    public static bool IsUrlDomainAllowed(ReadOnlySpan<char> url, ReadOnlySpan<char> allowedDomains)
    {
        var domain = ExtractDomainFromUrl(url);
        if (domain.IsEmpty)
            return false;

        // Split allowed domains and check each one
        int start = 0;
        for (int i = 0; i <= allowedDomains.Length; i++)
        {
            if (i == allowedDomains.Length || allowedDomains[i] == ',')
            {
                if (i > start)
                {
                    var allowedDomain = allowedDomains.Slice(start, i - start).Trim();
                    if (domain.Equals(allowedDomain, StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }
                start = i + 1;
            }
        }
        return false;
    }

    /// <summary>
    /// Extracts the domain portion from a URL using Span for performance
    /// </summary>
    /// <param name="url">The URL to parse</param>
    /// <returns>The domain portion of the URL</returns>
    public static ReadOnlySpan<char> ExtractDomainFromUrl(ReadOnlySpan<char> url)
    {
        // Find protocol separator
        var protocolIndex = url.IndexOf("://".AsSpan());
        if (protocolIndex == -1)
            return ReadOnlySpan<char>.Empty;

        var afterProtocol = url.Slice(protocolIndex + 3);

        // Find path separator
        var pathIndex = afterProtocol.IndexOf('/');
        var domain = pathIndex == -1 ? afterProtocol : afterProtocol.Slice(0, pathIndex);

        // Remove port if present
        var portIndex = domain.IndexOf(':');
        return portIndex == -1 ? domain : domain.Slice(0, portIndex);
    }

    /// <summary>
    /// Efficiently processes CSP directive values by removing unnecessary whitespace
    /// </summary>
    /// <param name="directiveValue">The directive value to process</param>
    /// <returns>Processed directive value</returns>
    public static string ProcessCspDirectiveValue(ReadOnlySpan<char> directiveValue)
    {
        if (directiveValue.IsEmpty)
            return string.Empty;

        Span<char> buffer = stackalloc char[directiveValue.Length];
        int writeIndex = 0;
        bool lastWasSpace = false;

        for (int i = 0; i < directiveValue.Length; i++)
        {
            char c = directiveValue[i];
            if (char.IsWhiteSpace(c))
            {
                if (!lastWasSpace && writeIndex > 0)
                {
                    buffer[writeIndex++] = ' ';
                    lastWasSpace = true;
                }
            }
            else
            {
                buffer[writeIndex++] = c;
                lastWasSpace = false;
            }
        }

        return buffer.Slice(0, writeIndex).ToString();
    }

    /// <summary>
    /// Validates if a nonce value has the correct format using Span operations
    /// </summary>
    /// <param name="nonce">The nonce value to validate</param>
    /// <returns>True if the nonce format is valid</returns>
    public static bool IsValidNonceFormat(ReadOnlySpan<char> nonce)
    {
        // CSP nonce should be base64 encoded and at least 16 characters
        if (nonce.Length < 16)
            return false;

        // Check if all characters are valid base64
        for (int i = 0; i < nonce.Length; i++)
        {
            char c = nonce[i];
            if (!IsBase64Char(c))
                return false;
        }

        return true;
    }

    private static bool IsBase64Char(char c)
    {
        return (c >= 'A' && c <= 'Z') ||
               (c >= 'a' && c <= 'z') ||
               (c >= '0' && c <= '9') ||
               c == '+' || c == '/' || c == '=';
    }
}