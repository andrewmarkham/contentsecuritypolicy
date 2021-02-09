namespace Jhoose.Security.Core.Models
{
    public class CspOptions 
    {
        public CspOptions()
        {
            this.None = false;
            this.Wildcard = false;
            this.Self = false;
            this.Data = false;
        }

        public bool None {get;set;}
        public bool Wildcard {get;set;}
        public bool Self {get;set;}
        public bool Data {get;set;}

    }
}