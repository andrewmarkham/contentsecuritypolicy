using System.Collections.Generic;

using Jhoose.Security.Models;
using Jhoose.Security.Repository;

namespace Jhoose.Security.Provider;

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
