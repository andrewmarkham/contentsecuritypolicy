namespace Jhoose.Security.Core.Models.SecurityHeaders
{
    public class CrossOriginEmbedderPolicyHeader : ResponseHeader
    {
        public override string Name => "Cross-Origin-Embedder-Policy";

        private string DetermineValue(CrossOriginEmbedderPolicyEnum mode)
        {
            switch (mode)
            {
                case CrossOriginEmbedderPolicyEnum.UnSafeNone:
                    return "unsafe-none";
                case CrossOriginEmbedderPolicyEnum.RequireCorp:
                    return "require-corp";

                default:
                    return "unsafe-none";
            }
        }

        public override string Value => DetermineValue(Mode);

        public CrossOriginEmbedderPolicyEnum Mode { get; set; } = CrossOriginEmbedderPolicyEnum.RequireCorp;
    }
}