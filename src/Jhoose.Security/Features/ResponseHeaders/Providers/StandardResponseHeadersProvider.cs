using System.Collections.Generic;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.ResponseHeaders.Models;

namespace Jhoose.Security.Features.ResponseHeaders.Providers;

public class StandardResponseHeadersProvider : IResponseHeadersProvider
{
    private readonly ISecurityRepository<ResponseHeader> responseHeadersRepository;

    public StandardResponseHeadersProvider(ISecurityRepository<ResponseHeader> responseHeadersRepository
        )
    {
        this.responseHeadersRepository = responseHeadersRepository;
    }

    public IEnumerable<ResponseHeader> ResponseHeaders()
    {
        return this.responseHeadersRepository.Load();
    }
}
