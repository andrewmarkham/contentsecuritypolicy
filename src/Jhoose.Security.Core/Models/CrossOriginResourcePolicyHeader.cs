namespace Jhoose.Security.Core.Models
{
    public class CrossOriginResourcePolicyHeader : ResponseHeader
    {
        public override string Name => "Cross-Origin-Resource-Policy";

        private string DetermineValue(CrossOriginResourcePolicyEnum mode)
        {
            switch (mode)
            {
                case CrossOriginResourcePolicyEnum.SameSite:
                    return "same-site";
                case CrossOriginResourcePolicyEnum.SameOrigin:
                    return "same-origin";
                case CrossOriginResourcePolicyEnum.CrossOrigin:
                    return "cross-origin";
                default:
                    return "same-origin";
            }
        }

        public override string Value => DetermineValue(Mode);

        public CrossOriginResourcePolicyEnum Mode {get;set;} = CrossOriginResourcePolicyEnum.SameOrigin;
    }
}