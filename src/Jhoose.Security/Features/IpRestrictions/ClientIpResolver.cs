using System.Net;

using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Features.IpRestrictions;

/// <summary>
/// Resolves the originating client IP address for a request.
/// </summary>
/// <remarks>
/// Prefers the <c>X-Forwarded-For</c> header, set by reverse proxies/CDNs (Cloudflare, Incapsula,
/// etc.), over the immediate TCP connection — behind such a proxy, <see cref="HttpContext.Connection"/>'s
/// remote address is the proxy's own edge node, not the visitor. The header is trusted whenever
/// present with no additional validation, so this is only safe to rely on for IP restriction when
/// the origin's network/firewall already prevents direct traffic from reaching it except through
/// the trusted proxy — otherwise a client can set this header itself to spoof any address.
/// </remarks>
public static class ClientIpResolver
{
    private const string ForwardedForHeader = "X-Forwarded-For";

    /// <summary>
    /// Returns the left-most address in the request's <c>X-Forwarded-For</c> header — by
    /// convention, the original client that a chain of proxies appends to — falling back to the
    /// direct connection's remote address when the header is absent or unparseable.
    /// </summary>
    public static IPAddress? Resolve(HttpRequest request)
    {
        var forwardedFor = request.Headers[ForwardedForHeader].ToString();

        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            var firstEntry = forwardedFor.Split(',')[0].Trim();

            if (IPAddress.TryParse(firstEntry, out var forwardedIp))
            {
                return forwardedIp;
            }
        }

        return request.HttpContext.Connection.RemoteIpAddress;
    }
}
