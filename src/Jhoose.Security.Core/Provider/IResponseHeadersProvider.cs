using System.Collections.Generic;

using Jhoose.Security.Core.Models;

namespace Jhoose.Security.Core.Provider;

public interface IResponseHeadersProvider
{
    IEnumerable<ResponseHeader> ResponseHeaders();

    void Initialize();
}