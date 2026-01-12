using System.Collections.Generic;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.ResponseHeaders.Models;

using Microsoft.Extensions.DependencyInjection;

namespace Jhoose.Security.Features.ResponseHeaders.Providers;

public class StandardResponseHeadersProvider : IResponseHeadersProvider
{
    private readonly ISecurityRepository<ResponseHeader> responseHeadersRepository;

    public StandardResponseHeadersProvider([FromKeyedServices("response")] ISecurityRepository<ResponseHeader> responseHeadersRepository
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
