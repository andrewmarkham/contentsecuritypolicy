using System;
using System.Collections.Generic;

using Jhoose.Security.Features.Data.Models;

namespace Jhoose.Security.Features.Core;

public interface ISecurityRepository<T> where T : class
{
    string CacheKey { get; }

    T? Save(T header);
    bool Save(ResponseHeaderStorage header);
    IEnumerable<T> Load();
    List<T> Load(string headerName);

    bool Delete(T header);
    bool Delete(Guid id);

    bool Clear();
    bool Clear(string headerName);
}
