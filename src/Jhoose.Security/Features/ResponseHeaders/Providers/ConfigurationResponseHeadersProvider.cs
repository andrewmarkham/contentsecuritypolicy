using System.Collections.Generic;
using System.Linq;

using Jhoose.Security.Configuration;
using Jhoose.Security.Features.ResponseHeaders.Models;

using Microsoft.Extensions.Options;

namespace Jhoose.Security.Features.ResponseHeaders.Providers;

/*Get the response headers from the configuration*/
public class ConfigurationResponseHeadersProvider : IResponseHeadersProvider
{
    private readonly IEnumerable<ResponseHeader>? securityHeaders;

    public ConfigurationResponseHeadersProvider(IOptions<JhooseSecurityOptions>? options)
    {
        securityHeaders = options?.Value.Headers;
    }

    public void Initialize()
    {
    }

    public IEnumerable<ResponseHeader> ResponseHeaders() => securityHeaders ?? Enumerable.Empty<ResponseHeader>();
}