using System.Collections.Generic;

using Jhoose.Security.Models.CSP;

namespace Jhoose.Security.Provider;

public interface ICspProvider
{
    CspSettings Settings { get; }
    IEnumerable<CspPolicyHeaderBase> PolicyHeaders();

    void Initialize();

    string GenerateNonce();
}