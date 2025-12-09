
using System.Collections.Generic;

using Jhoose.Security.Features.CSP.Models;

namespace Jhoose.Security.Features.CSP.Repository;

public interface ICspPolicyRepository
{
    List<CspPolicy> List();
    CspPolicy Update(CspPolicy policy);

    void Bootstrap();
}
