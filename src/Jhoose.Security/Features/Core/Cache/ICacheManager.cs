using System;

namespace Jhoose.Security.Features.Core.Cache;

/// <summary>
/// Defines a contract for managing cached data with support for insertion, retrieval, and removal operations.
/// </summary>
public interface ICacheManager
{
    /// <summary>
    /// Inserts an object into the cache with a specified key and duration.
    /// </summary>
    /// <param name="cacheKey">The unique identifier for the cached item.</param>
    /// <param name="value">The object to be cached.</param>
    /// <param name="duration">The time span for which the item should remain in the cache.</param>
    void Insert(string cacheKey, object value, TimeSpan duration);

    /// <summary>
    /// Retrieves a cached item by its key.
    /// </summary>
    /// <typeparam name="T">The type of the cached object, which must be a reference type.</typeparam>
    /// <param name="cacheKey">The unique identifier for the cached item.</param>
    /// <returns>The cached object of type <typeparamref name="T"/>, or null if the key is not found.</returns>
    T? Get<T>(string cacheKey) where T : class;

    /// <summary>
    /// Retrieves a cached item by its key, or generates and caches the value if it doesn't exist.
    /// </summary>
    /// <typeparam name="T">The type of the cached object, which must be a reference type.</typeparam>
    /// <param name="cacheKey">The unique identifier for the cached item.</param>
    /// <param name="getValue">A function that generates the value to be cached if it's not found.</param>
    /// <param name="duration">The time span for which the item should remain in the cache.</param>
    /// <returns>The cached or newly generated object of type <typeparamref name="T"/>.</returns>
    T? Get<T>(string cacheKey, Func<T> getValue, TimeSpan duration) where T : class;

    /// <summary>
    /// Removes a cached item by its key.
    /// </summary>
    /// <param name="cacheKey">The unique identifier for the cached item to be removed.</param>
    void Remove(string cacheKey);
}