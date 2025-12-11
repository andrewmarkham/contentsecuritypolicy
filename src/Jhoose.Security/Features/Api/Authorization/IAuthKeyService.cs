using Microsoft.Extensions.Primitives;

namespace Jhoose.Security.Features.Api.Authorization;

public interface IAuthKeyService
{
    bool Validate(StringValues stringValues);
}