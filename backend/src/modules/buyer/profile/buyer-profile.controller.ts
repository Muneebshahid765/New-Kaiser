/*eslint-disable*/
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import { BuyerProfileService } from './buyer-profile.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { UpdateProfileSchema, type UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordSchema, type ChangePasswordDto } from './dto/change-password.dto';

@Controller('buyer/profile')
export class BuyerProfileController {
  constructor(private readonly profileService: BuyerProfileService) {}

  // 1. GET PROFILE
  @Get()
  getProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  // 2. UPDATE PROFILE
  @Put()
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(UpdateProfileSchema)) dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }

  // 3. CHANGE PASSWORD
  @Put('change-password')
  changePassword(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(ChangePasswordSchema)) dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(userId, dto);
  }

}