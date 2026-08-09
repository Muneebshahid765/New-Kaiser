/* eslint-disable */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from 'src/core/database/prisma.module';
import { BuyerProfileController } from './controllers/buyer-profile.controller';
import { BuyerProfileService } from './services/buyer-profile.service';


@Module({
  imports: [
    PrismaModule,
    ConfigModule,

  ],

  controllers: [
     BuyerProfileController
  ],

  providers: [
    BuyerProfileService
  ],

  exports: [BuyerProfileService],
})
export class ProfileModule {}