using System.Collections.Generic;

using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.Settings.Models;

namespace Jhoose.Security.Features.CSP.Provider;

public interface ICspProvider
{
    CspSettings Settings { get; }
    IEnumerable<CspPolicyHeaderBase> PolicyHeaders();

    void Initialize();

    string GenerateNonce();
}