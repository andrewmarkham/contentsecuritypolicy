namespace Jhoose.Security.Core.Models
{
    public class XPermittedCrossDomainPoliciesHeader : ResponseHeader
    {
        public override string Name => "X-Permitted-Cross-Domain-Policies";

        private string DetermineValue(XPermittedCrossDomainPoliciesEnum mode)
        {
            switch (mode)
            {
                case XPermittedCrossDomainPoliciesEnum.None:
                    return "none";
                case XPermittedCrossDomainPoliciesEnum.MasterOnly:
                    return "master-only";
                case XPermittedCrossDomainPoliciesEnum.ByContentType:
                    return "by-content-type";
                case XPermittedCrossDomainPoliciesEnum.All:
                    return "all";
                default:
                    return "none";
            }
        }

        public override string Value => DetermineValue(Mode);

        public XPermittedCrossDomainPoliciesEnum Mode {get;set;} = XPermittedCrossDomainPoliciesEnum.None;
    }
}