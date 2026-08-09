import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Module({
  imports: [
    // Official NestJS CacheModule register karein (is se CACHE_MANAGER provider available ho jayega)
    NestCacheModule.register({
      isGlobal: true, // Optional: agar dynamic config / global caching chahte hain
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule], // NestCacheModule bhi export karein
})
export class CacheModule {}