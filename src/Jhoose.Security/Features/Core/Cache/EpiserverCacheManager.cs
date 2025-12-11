using System;

using EPiServer.Framework.Cache;

namespace Jhoose.Security.Features.Core.Cache;

/// <summary>
/// An implementation of <see cref="ICacheManager"/> that utilizes Episerver's synchronized object instance cache for caching operations.
/// </summary>
/// <param name="cache"></param>
public class EpiserverCacheManager(ISynchronizedObjectInstanceCache cache) : ICacheManager
{
    
    #pragma warning disable IDE0330
    private static readonly object lockObject = new();
    #pragma warning restore IDE0330

    /// <inheritdoc/>
    public void Insert(string cacheKey, object value, TimeSpan duration)
    {
        CacheEvictionPolicy cacheEvictionPolicy = new(duration, CacheTimeoutType.Absolute);

        cache.Insert(cacheKey, value, cacheEvictionPolicy);
    }

    /// <inheritdoc/>
    public T Get<T>(string cacheKey) where T : class
    {
        return cache.Get<T>(cacheKey, ReadStrategy.Wait);
    }

    /// <inheritdoc/>
    public T Get<T>(string cacheKey, Func<T> getValue, TimeSpan duration) where T : class
    {
        lock (lockObject)
        {
            T cachedValue = cache.Get<T>(cacheKey, ReadStrategy.Wait);

            if (cachedValue == null)
            {
                cachedValue = getValue();

                this.Insert(cacheKey, cachedValue, duration);
            }

            return cachedValue;
        }
    }

    /// <inheritdoc/>
    public void Remove(string cacheKey)
    {
        cache.Remove(cacheKey);
    }
}