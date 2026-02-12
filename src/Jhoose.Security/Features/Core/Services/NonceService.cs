using System;

namespace Jhoose.Security.Features.Core.Services;

public class NonceService : INonceService
{
    private readonly string nonceValue = Guid.NewGuid().ToString();

    public string GenerateNonce()
    {
        return this.nonceValue;
    }
}