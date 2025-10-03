using System;

namespace Jhoose.Security.Core.Cache;

public interface ICacheManager
{
    void Insert(string cacheKey, object value, TimeSpan duration);
    T Get<T>(string cacheKey) where T : class;
    T Get<T>(string cacheKey, Func<T> getValue, TimeSpan duration) where T : class;

    void Remove(string cacheKey);
}