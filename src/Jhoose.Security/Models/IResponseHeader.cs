namespace Jhoose.Security.Models;

public interface IResponseHeader
{
    bool Enabled { get; set; }
    string Name { get; }
    string Value { get; }
}