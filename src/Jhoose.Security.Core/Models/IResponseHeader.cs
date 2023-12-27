namespace Jhoose.Security.Core.Models
{
    public interface IResponseHeader
    {
        bool Enabled { get; set; }
        string Name { get; }
        string Value { get; }
    }
}