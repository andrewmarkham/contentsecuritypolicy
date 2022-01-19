namespace Jhoose.Security.Core.Models
{
    public class StrictTransportSecurityHeader : ResponseHeader
    {
        public override string Name => "Strict-Transport-Security";

        public override string Value => IncludeSubDomains ?  $"max-age={MaxAge}; includeSubDomains" : $"max-age={MaxAge};";

        public int MaxAge {get;set;} = 31536000;
        public bool IncludeSubDomains {get;set;} = true;
    }
}