using System.Collections.Generic;
using Jhoose.Security.Core.Models;

namespace Jhoose.Security.Core.Provider
{
    public interface ICspProvider
    {
        CspSettings Settings {get;}
        IEnumerable<CspPolicyHeader> PolicyHeaders();

        void Initialize();

        string GenerateNonce();
    }
}