/* eslint-disable */
import {
  Controller, Post, Get, Put, Body, Param, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common'
import { OrdersService }            from './orders.service'
import { Public }                   from 'src/common/decorators/public.decorator'
import {
  CreatePaymentIntentSchema, type CreatePaymentIntentDto,
} from './dto/create-payment-intent.dto'
import {
  GetOrdersFilterSchema, type GetOrdersFilterDto,
  UpdateOrderStatusSchema, type UpdateOrderStatusDto,
  CancelPaymentSchema,
} from './dto/get-orders.dto'
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post('create-payment-intent')
  @HttpCode(HttpStatus.OK)
  createPaymentIntent(
    @Body(ZodValidationPipe.for(CreatePaymentIntentSchema)) dto: CreatePaymentIntentDto,
  ) {
    return this.ordersService.createPaymentIntent(dto)
  }

  @Public()
  @Post('verify-payment')
  @HttpCode(HttpStatus.OK)
  verifyPayment(@Body('paymentIntentId') paymentIntentId: string) {
    return this.ordersService.verifyPayment(paymentIntentId)
  }

  @Public()
  @Get('order-status/:orderId')
  getOrderStatus(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderStatus(orderId)
  }

 
  @Get('all-orders')
  getAllOrders(
    @Query(new ZodValidationPipe(GetOrdersFilterSchema)) dto: GetOrdersFilterDto,
  ) {
    return this.ordersService.getAllOrders(dto)
  }

  @Put('update-status/:orderId')
  updateOrderStatus(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body(new ZodValidationPipe(UpdateOrderStatusSchema)) dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto)
  }


  @Get('details/:orderId')
  getOrderDetails(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.ordersService.getOrderDetails(orderId)
  }


  @Post('cancel-payment')
  @HttpCode(HttpStatus.OK)
  cancelPayment(
    @Body(new ZodValidationPipe(CancelPaymentSchema)) body: { orderId: string },
  ) {
    return this.ordersService.cancelPayment(body.orderId)
  }

  @Get('statistics')
  getStatistics() {
    return this.ordersService.getStatistics()
  }
}