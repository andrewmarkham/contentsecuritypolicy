using System.Collections.Generic;

using Jhoose.Security.Core.Models;

namespace Jhoose.Security.Core.Repository;

public interface IResponseHeadersRepository
{
    IEnumerable<ResponseHeader> List();
    T Update<T>(T policy) where T : ResponseHeader;

    void Bootstrap();
}