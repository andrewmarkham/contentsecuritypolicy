using System.Collections.Generic;

using Jhoose.Security.Features.ResponseHeaders.Models;


namespace Jhoose.Security.Features.Core.Providers;

public interface IHeaderProvider<T> where T : ResponseHeader
{
    IEnumerable<T> Headers(string siteId, string host);
}
