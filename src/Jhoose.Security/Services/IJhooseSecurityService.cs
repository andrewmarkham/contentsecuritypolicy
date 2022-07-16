using Jhoose.Security.Core.Models;

using System.Collections.Generic;

#if NET5_0_OR_GREATER
    using Microsoft.AspNetCore.Http;
#else
    using System.Web;
#endif

namespace Jhoose.Security.Services
{
    public interface IJhooseSecurityService
    {
        void AddContentSecurityPolicy(HttpResponse response);
        void AddHeaders(HttpResponse response, IEnumerable<ResponseHeader> headers);
    }
}