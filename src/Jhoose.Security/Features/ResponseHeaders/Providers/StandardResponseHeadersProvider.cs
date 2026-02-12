
using System.Collections.Generic;
using System.Linq;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.Core.Providers;
using Jhoose.Security.Features.ResponseHeaders.Models;

namespace Jhoose.Security.Features.ResponseHeaders.Providers;

public class StandardResponseHeadersProvider(ISecurityRepository<ResponseHeader> responseHeadersRepository) : HeaderProviderBase<ResponseHeader>
{
    public override IEnumerable<ResponseHeader> Headers( string siteId, string host)
    {
        var policies = responseHeadersRepository.Load() ?? [];
        
        var mergedPolicies = this.MergePolicies(siteId, policies.ToList());
            
        return mergedPolicies;
    }
}
