namespace Jhoose.Security.Features.Core.Model;

public interface ISitePolicy
{
    string Site { get; }

    string GroupingKey {get;}
}