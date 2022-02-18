namespace Jhoose.Security.Core.Models
{
    public abstract class ResponseHeader
    {
        public bool Enabled {get; set;} = true;
        public abstract string Name {get;}
        public abstract string Value {get;}
    }
}