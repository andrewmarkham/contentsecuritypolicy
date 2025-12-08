using System.Collections.Generic;

using Jhoose.Security.Models;

namespace Jhoose.Security.Provider;

public interface IPermissionsProvider
{
    IEnumerable<ResponseHeader> PermissionPolicies();

    void Initialize();
}