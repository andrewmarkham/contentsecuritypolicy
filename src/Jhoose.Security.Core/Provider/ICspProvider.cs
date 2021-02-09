using Jhoose.Security.Core.Models;

namespace Jhoose.Security.Core.Provider
{
    public interface ICspProvider
    {
         string HeaderValue();
         void Initialize();

         string GenerateNonce();
    }
}