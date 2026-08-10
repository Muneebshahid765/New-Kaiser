/*eslint-disable*/
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /** Get cached data */
  async get<T = any>(key: string): Promise<T | null> {
    const val = await this.cacheManager.get<T>(key);
    return val ?? null;
  }

  /** Delete single key */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /** Set key with expiration in seconds */
  async setex(key: string, ttlSeconds: number, value: any): Promise<void> {
    // cache-manager v5+ uses milliseconds for ttl
    await this.cacheManager.set(key, value, ttlSeconds * 1000);
  }

  /** Increment a numeric key value */
  async incr(key: string): Promise<number> {
    // Check if underlying store has native atomic `incr` (e.g., Redis client)
    const store = (this.cacheManager as any).store;
    if (store && typeof store.client?.incr === 'function') {
      return await store.client.incr(key);
    }

    // Fallback for memory store or custom providers
    const current = await this.get<number | string>(key);
    const numericVal = current ? Number(current) : 0;
    const newVal = numericVal + 1;

    await this.cacheManager.set(key, newVal);
    return newVal;
  }

  /** Delete keys matching pattern */
  async delByPattern(pattern: string): Promise<void> {
    const stores = (this.cacheManager as any).stores || [(this.cacheManager as any).store];
    for (const store of stores) {
      if (store && typeof store.keys === 'function') {
        const keys: string[] = await store.keys(pattern);
        if (keys && keys.length > 0) {
          await Promise.all(keys.map((key) => this.cacheManager.del(key)));
        }
      }
    }
  }
}