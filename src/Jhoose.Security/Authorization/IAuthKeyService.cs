using Microsoft.Extensions.Primitives;

namespace Jhoose.Security.Authorization
{
    public interface IAuthKeyService
    {
        bool Validate(StringValues stringValues);
    }
}