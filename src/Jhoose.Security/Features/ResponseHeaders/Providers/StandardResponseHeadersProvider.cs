using System.Collections.Generic;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.ResponseHeaders.Models;

namespace Jhoose.Security.Features.ResponseHeaders.Providers;

public class StandardResponseHeadersProvider : IResponseHeadersProvider
{
    private readonly ResponseHeaderRepository responseHeadersRepository;

    public StandardResponseHeadersProvider(ResponseHeaderRepository responseHeadersRepository
        )
    {
        this.responseHeadersRepository = responseHeadersRepository;
    }

    public void Initialize()
    {
        //this.responseHeadersRepository.Bootstrap();
    }

    public IEnumerable<ResponseHeader> ResponseHeaders()
    {
        return this.responseHeadersRepository.Load();
    }
}
