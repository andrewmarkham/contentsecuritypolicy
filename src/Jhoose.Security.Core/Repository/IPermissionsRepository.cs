using System.Collections.Generic;

using Jhoose.Security.Core.Models.Permissions;

namespace Jhoose.Security.Core.Repository;

public interface IPermissionsRepository
{
    IEnumerable<PermissionPolicy> List();
    T Update<T>(T policy) where T : PermissionPolicy;

    void Bootstrap();
    void Clear();
}
