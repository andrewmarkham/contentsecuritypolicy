using System.Collections.Generic;
using System.Linq;
using Jhoose.Security.Core.Models;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Core.Provider
{
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
}