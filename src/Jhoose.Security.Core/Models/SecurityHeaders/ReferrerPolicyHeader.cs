namespace Jhoose.Security.Core.Models.SecurityHeaders
{
    public class ReferrerPolicyHeader : ResponseHeader
    {
        public override string Name => "Referrer-Policy";

        private string DetermineValue(ReferrerPolicyEnum mode)
        {
            switch (mode)
            {
                case ReferrerPolicyEnum.NoReferrer:
                    return "no-referrer";
                case ReferrerPolicyEnum.NoReferrerWhenDownGrade:
                    return "no-referrer-when-downgrade";
                case ReferrerPolicyEnum.Origin:
                    return "origin";
                case ReferrerPolicyEnum.OriginWhenCrossOrigin:
                    return "origin-when-cross-origin";
                case ReferrerPolicyEnum.SameOrigin:
                    return "same-origin";
                case ReferrerPolicyEnum.StrictOrigin:
                    return "strict-origin";
                case ReferrerPolicyEnum.StrictOriginWhenCrossOrigin:
                    return "strict-origin-when-cross-origin";
                case ReferrerPolicyEnum.UnsafeUrl:
                    return "unsafe-url";
                default:
                    return "no-referrer";
            }
        }

        public override string Value => DetermineValue(Mode);

        public ReferrerPolicyEnum Mode { get; set; } = ReferrerPolicyEnum.NoReferrer;
    }
}