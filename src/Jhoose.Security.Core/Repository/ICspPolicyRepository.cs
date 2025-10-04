
using System.Collections.Generic;

using Jhoose.Security.Core.Models.CSP;

namespace Jhoose.Security.Core.Repository;

public interface ICspPolicyRepository
{
    List<CspPolicy> List();
    CspPolicy Update(CspPolicy policy);


    CspSettings Settings();

    bool SaveSettings(CspSettings settings);

    void Bootstrap();
}