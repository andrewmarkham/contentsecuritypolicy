using System.Collections.Generic;
using Jhoose.Security.Configuration;
using Jhoose.Security.Features.Core.Providers;

using Jhoose.Security.Features.ResponseHeaders.Models;

using Microsoft.Extensions.Options;

namespace Jhoose.Security.Features.ResponseHeaders.Providers;

/*Get the response headers from the configuration*/
public class ConfigurationResponseHeadersProvider(IOptions<JhooseSecurityOptions>? options) : IHeaderProvider<ResponseHeader>
{
    private readonly IEnumerable<ResponseHeader>? securityHeaders = options?.Value.Headers;

    public IEnumerable<ResponseHeader> Headers(string siteId, string host) => securityHeaders ?? [];
}