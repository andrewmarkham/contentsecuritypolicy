using System.Collections.Generic;
using System.Text.Json;

using Jhoose.Security.Configuration;
using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.Data.Models;
using Jhoose.Security.Features.ResponseHeaders.Models;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.ResponseHeaders.Repository;

public class ResponseHeaderRepository(ILogger<ResponseHeaderRepository> logger, IConfiguration configuration) : SecurityRepositoryBase<ResponseHeader>(logger, configuration)
{
    const string HeaderName = "Response-Policy";

    public override string CacheKey => "ResponseHeaderCacheKey";

    public override IEnumerable<ResponseHeader> Load()
    {
        var headers = Load(HeaderName) ?? [];

        if (!(headers.Count > 0))
        {
            var defaultOptions = new JhooseSecurityOptions();
            foreach (var p in defaultOptions.Headers)
            {
                Save(p);
            }

            headers = Load(HeaderName) ?? [];
        }

        return headers;
    }

    public override ResponseHeader? Save(ResponseHeader header)
    {
        var storage = new ResponseHeaderStorage(header.Id, HeaderName, header.Name, JsonSerializer.Serialize(header));

        return Save(storage) ? header : null;
    }

    public override bool Delete(ResponseHeader header)
    {
        return Delete(header.Id);
    }

    public override bool Clear()
    {
        return Clear(HeaderName);
    }
}
