using System;

namespace Jhoose.Security.Core.Models
{
    public class CspPolicy
    {
        public CspPolicy()
        {
            this.Id = Guid.NewGuid();
            this.Order = 1;
            this.Level = CspPolicyLevel.Level1;
            this.Options = new CspOptions();
            this.PolicyName = string.Empty;
            this.Value = string.Empty;
            this.SummaryText = string.Empty;
        }

        public Guid Id {get; set;}
        public int Order {get;set;}
        public CspPolicyLevel Level {get;set;} 
        public string PolicyName {get;set;}
        public CspOptions Options {get;set;}

        public string Value {get;set;}

        public string SummaryText {get;set;}
    }
}