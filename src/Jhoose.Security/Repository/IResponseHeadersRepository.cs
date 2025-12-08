using System.Collections.Generic;

using Jhoose.Security.Models;

namespace Jhoose.Security.Repository;

public interface IResponseHeadersRepository
{
    IEnumerable<ResponseHeader> List();
    T Update<T>(T policy) where T : ResponseHeader;

    void Bootstrap();
}
