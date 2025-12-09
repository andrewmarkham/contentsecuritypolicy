using System.Collections.Generic;

using Jhoose.Security.Features.ResponseHeaders.Models;

namespace Jhoose.Security.Features.Permissions.Providers;

public interface IPermissionsProvider
{
    IEnumerable<ResponseHeader> PermissionPolicies();

    void Initialize();
}