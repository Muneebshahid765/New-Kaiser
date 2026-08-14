import { Module } from '@nestjs/common';
import { BuyerDashboardService } from './dashboard/buyer-dashboard.service';
import { BuyerDashboardController } from './dashboard/buyer-dashboard.controller';

@Module({
  controllers: [BuyerDashboardController],
  providers: [
    
   
     BuyerDashboardService
   
  ],
  exports: [BuyerDashboardService],
})
export class BuyerModule {}