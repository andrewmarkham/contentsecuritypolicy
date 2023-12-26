namespace Jhoose.Security.Core.Models.SecurityHeaders
{
    public class CrossOriginOpenerPolicyHeader : ResponseHeader
    {
        public override string Name => "Cross-Origin-Opener-Policy";

        private string DetermineValue(CrossOriginOpenerPolicyEnum mode)
        {
            switch (mode)
            {
                case CrossOriginOpenerPolicyEnum.UnSafeNone:
                    return "unsafe-none";
                case CrossOriginOpenerPolicyEnum.SameOrigin:
                    return "same-origin";
                case CrossOriginOpenerPolicyEnum.SameOriginAllowPopups:
                    return "same-origin-allow-popups";
                default:
                    return "unsafe-none";
            }
        }

        public override string Value => DetermineValue(Mode);

        public CrossOriginOpenerPolicyEnum Mode { get; set; } = CrossOriginOpenerPolicyEnum.SameOrigin;
    }
}