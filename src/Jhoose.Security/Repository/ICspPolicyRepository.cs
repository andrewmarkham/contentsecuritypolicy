
using System.Collections.Generic;

using Jhoose.Security.Models.CSP;

namespace Jhoose.Security.Repository;

public interface ICspPolicyRepository
{
    List<CspPolicy> List();
    CspPolicy Update(CspPolicy policy);

    void Bootstrap();
}
