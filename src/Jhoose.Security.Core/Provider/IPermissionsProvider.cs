using System.Collections.Generic;

using Jhoose.Security.Core.Models;

namespace Jhoose.Security.Core.Provider;

public interface IPermissionsProvider
{
    IEnumerable<ResponseHeader> PermissionPolicies();

    void Initialize();
}