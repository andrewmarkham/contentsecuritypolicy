using System;
using System.Collections.Generic;

using Jhoose.Security.Features.Permissions.Models;

namespace Jhoose.Security.Features.Permissions.Repository;

[Obsolete(error:true, message:"Use BaseCspPolicyRepository instead")]
public interface IPermissionsRepository
{
    IEnumerable<PermissionPolicy> List();
    T Update<T>(T policy) where T : PermissionPolicy;

    void Bootstrap();
    void Clear();
}
