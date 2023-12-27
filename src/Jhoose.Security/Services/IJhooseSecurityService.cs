using Jhoose.Security.Core.Models;

using System.Collections.Generic;

using Microsoft.AspNetCore.Http;

namespace Jhoose.Security.Services
{
    public interface IJhooseSecurityService
    {
        void AddContentSecurityPolicy(HttpResponse response);
        void AddHeaders(HttpResponse response);
    }
}