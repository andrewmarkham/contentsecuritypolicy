using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Features.Core.Services;

/// <summary>
/// Defines a service for applying security-related HTTP headers to responses.
/// </summary>
/// <remarks>
/// This service provides methods to add various security headers including Content Security Policy (CSP),
/// Permissions Policy, and other security-related HTTP headers to enhance application security.
/// </remarks>
public interface IJhooseSecurityService
{
    /// <summary>
    /// Adds the Content Security Policy (CSP) header to the specified HTTP response.
    /// </summary>
    /// <param name="response"></param>
    void AddContentSecurityPolicy(HttpResponse response);
    /// <summary>
    /// Adds the Permissions Policy header to the specified HTTP response.
    /// </summary>
    /// <param name="response"></param>
    void AddPermissionsPolicy(HttpResponse response);
    /// <summary>
    /// Adds other security-related headers to the specified HTTP response.
    /// </summary>
    /// <param name="response"></param>
    void AddHeaders(HttpResponse response);
}