namespace Jhoose.Security.Core.Models.CSP
{
    public class CspPolicyReportHeader : CspPolicyHeaderBase
    {
        public CspPolicyReportHeader(CspSettings settings,string host) : base(settings, host)
        {
        }

        public override string Name => "Content-Security-Policy-Report-Only";
    }
}