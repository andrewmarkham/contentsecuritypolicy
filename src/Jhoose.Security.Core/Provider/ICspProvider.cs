using System.Collections.Generic;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.CSP;

namespace Jhoose.Security.Core.Provider
{
    public interface ICspProvider
    {
        CspSettings Settings { get; }
        IEnumerable<CspPolicyHeaderBase> PolicyHeaders();

        void Initialize();

        string GenerateNonce();
    }
}