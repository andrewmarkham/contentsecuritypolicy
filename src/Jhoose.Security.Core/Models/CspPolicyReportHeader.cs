namespace Jhoose.Security.Core.Models
{
    public class CspPolicyReportHeader : CspPolicyHeaderBase
    {
        public CspPolicyReportHeader(string reportUrl) : base(reportUrl)
        {
        }

        public override string Name => "Content-Security-Policy-Report-Only";
    }
}