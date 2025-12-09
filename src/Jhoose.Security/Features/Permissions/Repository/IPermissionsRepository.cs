using System.Collections.Generic;

using Jhoose.Security.Features.Permissions.Models;

namespace Jhoose.Security.Features.Permissions.Repository;

public interface IPermissionsRepository
{
    IEnumerable<PermissionPolicy> List();
    T Update<T>(T policy) where T : PermissionPolicy;

    void Bootstrap();
    void Clear();
}
