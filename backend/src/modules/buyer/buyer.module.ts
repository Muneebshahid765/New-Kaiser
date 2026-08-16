import { Module } from '@nestjs/common';
import { BuyerDashboardService } from './dashboard/buyer-dashboard.service';
import { BuyerDashboardController } from './dashboard/buyer-dashboard.controller';
import { BuyerAddressController } from './address/buyer-address.controller';
import { BuyerAddressService } from './address/buyer-address.service';
import { BuyerReviewService } from './reviews/buyer-reviews.service';
import { BuyerReviewController } from './reviews/buyer-reviews.controller';
import { BuyerProfileController } from './profile/buyer-profile.controller';
import { BuyerProfileService } from './profile/buyer-profile.service';

@Module({
  controllers: [BuyerDashboardController,BuyerAddressController, BuyerReviewController, BuyerProfileController],
  providers: [
    
   
     BuyerDashboardService,
     BuyerAddressService,
     BuyerReviewService,BuyerProfileService
   
  ],
  exports: [BuyerDashboardService,BuyerAddressService, BuyerReviewService, BuyerProfileService ],
})
export class BuyerModule {}