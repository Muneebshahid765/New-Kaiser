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

import { BuyerProfileService } from '../services/buyer-profile.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { UpdateProfileSchema, type UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordSchema, type ChangePasswordDto } from '../dto/change-password.dto';
import { CreateAddressSchema, type CreateAddressDto } from '../dto/create-address.dto';

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

  // --- ADDRESS ROUTES ---

  // 4. GET ALL ADDRESSES
  @Get('addresses')
  getAddresses(@CurrentUser('id') userId: string) {
    return this.profileService.getAddresses(userId);
  }

  // 5. ADD ADDRESS
  @Post('addresses')
  addAddress(
    @CurrentUser('id') userId: string,
    @Body(ZodValidationPipe.for(CreateAddressSchema)) dto: CreateAddressDto,
  ) {
    return this.profileService.addAddress(userId, dto);
  }

  // 6. UPDATE ADDRESS
  @Put('addresses/:addressId')
  updateAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
    @Body() dto: Partial<CreateAddressDto>,
  ) {
    return this.profileService.updateAddress(userId, addressId, dto);
  }

  // 7. SET DEFAULT ADDRESS
  @Patch('addresses/:addressId/default')
  setDefaultAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.profileService.setDefaultAddress(userId, addressId);
  }

  // 8. DELETE ADDRESS
  @Delete('addresses/:addressId')
  deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.profileService.deleteAddress(userId, addressId);
  }
}