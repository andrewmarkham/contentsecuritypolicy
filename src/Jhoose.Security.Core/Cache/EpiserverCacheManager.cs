using System;
using EPiServer.Framework.Cache;

namespace Jhoose.Security.Core.Cache
{
    public class EpiserverCacheManager : ICacheManager
    {
        private readonly ISynchronizedObjectInstanceCache cache;
        private static object lockObject = new object();

        public EpiserverCacheManager(ISynchronizedObjectInstanceCache cache)
        {
            this.cache = cache;
        }

        public void Insert(string cacheKey, object value, TimeSpan duration)
        {
            CacheEvictionPolicy cacheEvictionPolicy = new CacheEvictionPolicy(duration, CacheTimeoutType.Absolute);

            this.cache.Insert(cacheKey, value, cacheEvictionPolicy);
        }

        public T Get<T>(string cacheKey) where T : class
        {
            return this.cache.Get<T>(cacheKey, ReadStrategy.Wait);
        }

        public T Get<T>(string cacheKey, Func<T> getValue, TimeSpan duration) where T : class
        {
            lock (lockObject)
            {
                T cachedValue = this.cache.Get<T>(cacheKey, ReadStrategy.Wait);

                if (cachedValue == null)
                {
                    cachedValue = getValue();

                    this.Insert(cacheKey, cachedValue, duration);
                }

                return cachedValue;
            }
        }

        public void Remove(string cacheKey)
        {
            this.cache.Remove(cacheKey);
        }
    }
}