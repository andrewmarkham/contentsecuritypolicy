using System.Net;

namespace Jhoose.Security.Features.IpRestrictions;

/// <summary>
/// Parses IP restriction entry values (bare addresses or CIDR ranges, IPv4 or IPv6) into <see cref="IPNetwork"/> instances.
/// </summary>
public static class IpNetworkParser
{
    /// <summary>
    /// Attempts to parse a bare IP address or a CIDR range into an <see cref="IPNetwork"/>.
    /// A bare address is treated as a single-address network (/32 for IPv4, /128 for IPv6).
    /// </summary>
    public static bool TryParse(string? value, out IPNetwork network)
    {
        network = default;

        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var trimmed = value.Trim();

        if (trimmed.Contains('/'))
        {
            return IPNetwork.TryParse(trimmed, out network);
        }

        if (!IPAddress.TryParse(trimmed, out var address))
        {
            return false;
        }

        var prefixLength = address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6 ? 128 : 32;
        network = new IPNetwork(address, prefixLength);
        return true;
    }

    /// <summary>
    /// Returns true if <paramref name="value"/> is a valid bare IP address or CIDR range.
    /// </summary>
    public static bool IsValid(string? value) => TryParse(value, out _);
}
