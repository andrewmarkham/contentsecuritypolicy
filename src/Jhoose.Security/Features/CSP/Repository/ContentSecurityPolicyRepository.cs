using System.Collections.Generic;
using System.Text.Json;

using Jhoose.Security.Features.Core;

using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.Data.Models;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.CSP.Repository;

public class ContentSecurityPolicyRepository(ILogger<ContentSecurityPolicyRepository> logger, IConfiguration configuration) : SecurityRepositoryBase<CspPolicy>(logger, configuration)
{
    const string HeaderName = "Content-Security-Policy";

    public override string CacheKey => "CspPolicyCacheKey";

    public override IEnumerable<CspPolicy> Load()
    {
        var headers = Load(HeaderName) ?? [];

        return headers;
    }

    public override CspPolicy? Save(CspPolicy header)
    {
        var storage = new ResponseHeaderStorage(header.Id, HeaderName, header.PolicyName, JsonSerializer.Serialize(header));

        return Save(storage) ? header : null;
    }

    public override bool Delete(CspPolicy header)
    {
        return Delete(header.Id);
    }

    public override bool Clear()
    {
        return Clear(HeaderName);
    }
}
