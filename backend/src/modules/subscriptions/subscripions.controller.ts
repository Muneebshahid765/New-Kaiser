import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, ParseUUIDPipe, Req,
} from '@nestjs/common'
import { SubscriptionsService }       from './subscriptions.service'
import { Public }                     from 'src/common/decorators/public.decorator'
import {
  CreatePlanSchema, type CreatePlanDto,
  UpdatePlanSchema, type UpdatePlanDto,
  GetSubscribersFilterSchema, type GetSubscribersFilterDto,
} from './dto/subscriptions.dto'
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe'

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  // ─── Public ───────────────────────────────────────────────────────────────────
  @Public()
  @Get('plans')
  getPublicPlans() { return this.service.getPublicPlans() }

  @Public()
  @Get('plans/:id')
  getPlanById(@Param('id', ParseUUIDPipe) id: string) { return this.service.getPlanById(id) }

  // ─── Admin ────────────────────────────────────────────────────────────────────
//   @AdminOnly()
  @Get('admin/plans')
  adminGetAllPlans() { return this.service.adminGetAllPlans() }

//   @AdminOnly()
  @Post('admin/plans')
  adminCreatePlan(@Body(ZodValidationPipe.for(CreatePlanSchema)) dto: CreatePlanDto) {
    return this.service.adminCreatePlan(dto)
  }

//   @AdminOnly()
  @Put('admin/plans/:id')
  adminUpdatePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdatePlanSchema)) dto: UpdatePlanDto,
  ) { return this.service.adminUpdatePlan(id, dto) }

//   @AdminOnly()
  @Delete('admin/plans/:id')
  adminDeletePlan(@Param('id', ParseUUIDPipe) id: string) { return this.service.adminDeletePlan(id) }

//   @AdminOnly()
  @Get('admin/subscribers')
  adminGetSubscribers(
    @Query(ZodValidationPipe.for(GetSubscribersFilterSchema)) dto: GetSubscribersFilterDto,
  ) { return this.service.adminGetSubscribers(dto) }

//   @AdminOnly()
  @Get('admin/stats')
  adminGetStats() { return this.service.adminGetStats() }

//   @AdminOnly()
  @Post('admin/subscriber/:id/cancel')
  adminCancelSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('immediate') immediate: boolean,
  ) { return this.service.adminCancelSubscription(id, immediate ?? false) }

  // ─── Buyer ────────────────────────────────────────────────────────────────────
  @Get('my-subscription')
  getMySubscription(@Req() req: any) {
    return this.service.getMySubscription(req.user.buyerProfileId)
  }

  @Get('history')
  getHistory(@Req() req: any) {
    return this.service.getSubscriptionHistory(req.user.buyerProfileId)
  }
}