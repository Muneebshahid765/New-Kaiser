import { Module } from '@nestjs/common';
import { CacheModule } from 'src/core/cache/redis/cache.module';
import { SubscriptionsController } from './subscripions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
    imports: [CacheModule],
  controllers: [SubscriptionsController],
  providers: [
    
     SubscriptionsService
   
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionModule {}