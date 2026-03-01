using System;
using System.Collections.Concurrent;
using System.Threading;

using EPiServer.Framework.Cache;

namespace Jhoose.Security.Features.Core.Cache;

/// <summary>
/// An implementation of <see cref="ICacheManager"/> that utilizes Episerver's synchronized object instance cache for caching operations.
/// </summary>
/// <param name="cache"></param>
public class EpiserverCacheManager(ISynchronizedObjectInstanceCache cache) : ICacheManager
{
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> keyLocks = new(StringComparer.Ordinal);
    private static readonly TimeSpan lockWaitTimeout = TimeSpan.FromSeconds(2);

    /// <inheritdoc/>
    public void Insert(string cacheKey, object value, TimeSpan duration)
    {
        CacheEvictionPolicy cacheEvictionPolicy = new(duration, CacheTimeoutType.Absolute);

        cache.Insert(cacheKey, value, cacheEvictionPolicy);
    }

    /// <inheritdoc/>
    public T? Get<T>(string cacheKey) where T : class
    {
        if (cache.TryGet<T>(cacheKey, ReadStrategy.Wait, out var cachedValue))
        {
            return cachedValue;
        }

        var semaphore = keyLocks.GetOrAdd(cacheKey, _ => new SemaphoreSlim(1, 1));
        if (!semaphore.Wait(lockWaitTimeout))
        {
            return cache.TryGet<T>(cacheKey, ReadStrategy.Wait, out cachedValue) ? cachedValue : null;
        }
        try
        {
            return cache.TryGet<T>(cacheKey, ReadStrategy.Wait, out cachedValue) ? cachedValue : null;
        }
        finally
        {
            semaphore.Release();
        }
    }

    /// <inheritdoc/>
    public T? Get<T>(string cacheKey, Func<T> getValue, TimeSpan duration) where T : class
    {
        if (cache.TryGet<T>(cacheKey, ReadStrategy.Wait, out var cachedValue))
        {
            return cachedValue;
        }

        var semaphore = keyLocks.GetOrAdd(cacheKey, _ => new SemaphoreSlim(1, 1));
        if (!semaphore.Wait(lockWaitTimeout))
        {
            if (cache.TryGet<T>(cacheKey, ReadStrategy.Wait, out cachedValue))
            {
                return cachedValue;
            }

            return getValue();
        }
        try
        {
            if (cache.TryGet<T>(cacheKey, ReadStrategy.Wait, out cachedValue))
            {
                return cachedValue;
            }

            cachedValue = getValue();
            this.Insert(cacheKey, cachedValue, duration);
            return cachedValue;
        }
        finally
        {
            semaphore.Release();
        }
    }

    /// <inheritdoc/>
    public void Remove(string cacheKey)
    {
        cache.Remove(cacheKey);
    }
}
