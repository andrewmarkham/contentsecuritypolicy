using System;
using System.Collections.Generic;
using System.Linq;

using Jhoose.Security.Features.Core.Cache;
using Jhoose.Security.Features.Data.Models;

namespace Jhoose.Security.Features.Core;

public class CachedSecurityRepository<T>(ISecurityRepository<T> innerRepository, ICacheManager cache) : ISecurityRepository<T> where T : class
{
    private static readonly TimeSpan cacheDuration = TimeSpan.FromMinutes(60);

    public string CacheKey => innerRepository.CacheKey;

    public IEnumerable<T> Load()
    {
        var cachedItems = cache.Get<List<T>>(CacheKey);
        if (cachedItems is not null)
        {
            return cachedItems;
        }

        var items = innerRepository.Load()?.ToList() ?? [];
        if (items.Count > 0)
        {
            cache.Insert(CacheKey, items, cacheDuration);
        }
        return items;
    }

    public List<T> Load(string headerName)
    {
        var cachedItems = cache.Get<List<T>>(CacheKey);
        if (cachedItems is not null)
        {
            return cachedItems;
        }

        var items = innerRepository.Load()?.ToList() ?? [];
        if (items.Count > 0)
        {
            cache.Insert(CacheKey, items, cacheDuration);
        }
        return items;
    }


    public T? Save(T header)
    {
        var result = innerRepository.Save(header);
        if (result != null)
        {
            cache.Remove(CacheKey);
        }
        return result;
    }

    public bool Save(ResponseHeaderStorage header)
    {
        var result = innerRepository.Save(header);
        if (result)
        {
            cache.Remove(CacheKey);
        }
        return result;
    }
    
    public bool Delete(T header)
    {
        var result = innerRepository.Delete(header);
        if (result)
        {
            cache.Remove(CacheKey);
        }
        return result;
    }

    public bool Delete(Guid id)
    {
        var result = innerRepository.Delete(id);
        if (result)
        {
            cache.Remove(CacheKey);
        }
        return result;
    }

    public bool Clear()
    {
        var result = innerRepository.Clear();
        if (result)
        {
            cache.Remove(CacheKey);
        }
        return result;
    }

    public bool Clear(string headerName)
    {
        var result = innerRepository.Clear(headerName);
        if (result)
        {
            cache.Remove(CacheKey);
        }
        return result;
    }
}