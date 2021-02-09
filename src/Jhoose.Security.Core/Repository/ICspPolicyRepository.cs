using System;
using System.Collections.Generic;
using Jhoose.Security.Core.Models;

namespace Jhoose.Security.Core.Repository
{
    public interface ICspPolicyRepository
    {
         List<CspPolicy> List();
         CspPolicy Update(CspPolicy policy);
         void Bootstrap();
    }
}