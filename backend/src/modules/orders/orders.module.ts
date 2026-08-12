import { Module } from '@nestjs/common';
import { CacheModule } from 'src/core/cache/redis/cache.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [CacheModule],
  controllers: [OrdersController],
  providers: [
    
     OrdersService
   
  ],
  exports: [OrdersService],
})
export class OrderModule {}