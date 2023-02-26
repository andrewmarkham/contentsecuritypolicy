using System.Collections.Generic;
using System.Text;

namespace Jhoose.Security.Core.Models.CSP
{

    public class CspPolicyHeader : CspPolicyHeaderBase
    {
        public CspPolicyHeader(CspSettings settings) : base(settings)
        {
        }

        public override string Name => "Content-Security-Policy";
    }
}