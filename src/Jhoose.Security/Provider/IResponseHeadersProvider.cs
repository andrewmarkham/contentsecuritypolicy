using System.Collections.Generic;

using Jhoose.Security.Models;

namespace Jhoose.Security.Provider;

public interface IResponseHeadersProvider
{
    IEnumerable<ResponseHeader> ResponseHeaders();

    void Initialize();
}
