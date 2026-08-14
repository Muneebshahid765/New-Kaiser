import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { BuyerOrdersService } from './buyer-order.service';
import { getBuyerOrdersSchema, type GetBuyerOrdersDto } from '../dto/buyer-order.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AppRole, Roles } from 'src/common/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';


@Controller('buyer/orders')
@UseGuards(RolesGuard)
export class BuyerOrdersController {
  constructor(private readonly buyerOrdersService: BuyerOrdersService) {}

  // GET /api/buyer/orders?page=1&limit=10&orderStatus=processing

  @Get()
async getMyOrders(
  @Req() req,
  @Query() dto: GetBuyerOrdersDto,
) {
  // req.user.id = User table ki primary key ID
  // req.user.email = Logged in user ki email
  return this.buyerOrdersService.getMyOrders(
    req.user.id, 
    req.user.email, 
    dto
  );
}

// GET /api/buyer/orders/:id
@Get(':id')
async getMyOrderDetail(
  @Param('id', ParseUUIDPipe) orderId: string,
  @CurrentUser() user: { id: string; email: string }, // 👈 user.id (User primary key)
) {
  return this.buyerOrdersService.getMyOrderDetail(
    orderId,
    user.id,
    user.email,
  );
}

// PATCH /api/buyer/orders/:id/cancel
@Patch(':id/cancel')
async cancelMyOrder(
  @Param('id', ParseUUIDPipe) orderId: string,
  @CurrentUser() user: { id: string; email: string },
) {
  return this.buyerOrdersService.cancelMyOrder(
    orderId,
    user.id,
    user.email,
  );
}

}