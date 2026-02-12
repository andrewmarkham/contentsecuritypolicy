namespace Jhoose.Security.Features.Api.Models;

/// <summary>
/// Represents a request for header information containing a nonce value.
/// </summary>
/// <param name="Nonce">The cryptographic nonce (number used once) value for the header.</param>
/// <param name="HostName">The hostname for which the headers are requested.</param>
public record HeaderRequest(string Nonce, string HostName);
