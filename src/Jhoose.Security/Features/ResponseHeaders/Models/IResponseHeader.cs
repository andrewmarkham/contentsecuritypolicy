namespace Jhoose.Security.Features.ResponseHeaders.Models;

public interface IResponseHeader
{
    bool Enabled { get; set; }
    string Name { get; }
    string Value { get; }
}