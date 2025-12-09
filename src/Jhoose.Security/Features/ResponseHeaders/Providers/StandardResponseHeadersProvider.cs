using System.Collections.Generic;

using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.ResponseHeaders.Repository;

namespace Jhoose.Security.Features.ResponseHeaders.Providers;

public class StandardResponseHeadersProvider : IResponseHeadersProvider
{
    private readonly IResponseHeadersRepository responseHeadersRepository;

    public StandardResponseHeadersProvider(IResponseHeadersRepository responseHeadersRepository
        )
    {
        this.responseHeadersRepository = responseHeadersRepository;
    }

    public void Initialize()
    {
        this.responseHeadersRepository.Bootstrap();
    }

    public IEnumerable<ResponseHeader> ResponseHeaders()
    {
        return this.responseHeadersRepository.List();
    }
}
