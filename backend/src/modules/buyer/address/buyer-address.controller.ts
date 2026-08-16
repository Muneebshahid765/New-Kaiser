import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UsePipes,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { BuyerAddressService } from './buyer-address.service';
import {
  CreateBuyerAddressSchema,
  UpdateBuyerAddressSchema,
  type CreateBuyerAddressDto,
  type  UpdateBuyerAddressDto,
} from '../dto/buyer-address.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';


@Controller('buyer/addresses')
export class BuyerAddressController {
  constructor(private readonly addressService: BuyerAddressService) {}

  // GET /api/buyer/addresses
  @Get()
  async getAllAddresses(@CurrentUser() user: { id: string }) {
    return this.addressService.getAllAddresses(user.id);
  }

  // GET /api/buyer/addresses/:id
  @Get(':id')
  async getAddressById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.addressService.getAddressById(id, user.id);
  }

  // POST /api/buyer/addresses
  @Post()
 
  async createAddress(
    @CurrentUser() user: { id: string },
    @Body(ZodValidationPipe.for(CreateBuyerAddressSchema)) dto: CreateBuyerAddressDto,
  ) {
    return this.addressService.createAddress(user.id, dto);
  }

  // PATCH /api/buyer/addresses/:id
  @Patch(':id')
  async updateAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body(ZodValidationPipe.for(UpdateBuyerAddressSchema))
    dto: UpdateBuyerAddressDto,
  ) {
    return this.addressService.updateAddress(id, user.id, dto);
  }

  // PATCH /api/buyer/addresses/:id/set-default
  @Patch(':id/set-default')
  async setDefaultAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.addressService.setDefaultAddress(id, user.id);
  }

  // DELETE /api/buyer/addresses/:id
  @Delete(':id')
  async deleteAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.addressService.deleteAddress(id, user.id);
  }
}