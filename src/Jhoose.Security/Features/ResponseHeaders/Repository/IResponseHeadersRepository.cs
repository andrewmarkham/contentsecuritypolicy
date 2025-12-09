using System.Collections.Generic;

using Jhoose.Security.Features.ResponseHeaders.Models;

namespace Jhoose.Security.Features.ResponseHeaders.Repository;

public interface IResponseHeadersRepository
{
    IEnumerable<ResponseHeader> List();
    T Update<T>(T policy) where T : ResponseHeader;

    void Bootstrap();
}
