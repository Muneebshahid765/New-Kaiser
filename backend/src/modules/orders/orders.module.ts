import { Module } from '@nestjs/common';
import { CacheModule } from 'src/core/cache/redis/cache.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { BuyerOrdersController } from './buyer-order/buyer-order.controller';
import { BuyerOrdersService } from './buyer-order/buyer-order.service';

@Module({
  imports: [CacheModule],
  controllers: [OrdersController,BuyerOrdersController],
  providers: [
    
     OrdersService,
     BuyerOrdersService
   
  ],
  exports: [OrdersService,BuyerOrdersService],
})
export class OrderModule {}