namespace Jhoose.Security.Core.Models
{
    public class CspPolicyReportHeader : CspPolicyHeaderBase
    {
        public CspPolicyReportHeader(CspSettings settings) : base(settings)
        {
        }

        public override string Name => "Content-Security-Policy-Report-Only";
    }
}