import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { BuyerDashboardService } from './buyer-dashboard.service';
import {
  DashboardQuerySchema,
  type DashboardQueryDto,
} from '../dto/buyer-dashboard.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'; // <-- اپنا درست Guard Path لگائیں

@Controller('buyer/dashboard')
@UseGuards(JwtAuthGuard) // 1. Auth Guard یقینی بنائیں
export class BuyerDashboardController {
  constructor(private readonly dashboardService: BuyerDashboardService) {}

  @Get()
  async getDashboardData(
    @CurrentUser() user: any,
    // 2. Pipe کو صرف @Query() parameter پر محدود کریں
    @Query(ZodValidationPipe.for(DashboardQuerySchema)) query: DashboardQueryDto,
  ) {

    console.log('Decoded User Payload:', user);
    
    const userId = user?.id || user?.userId || user?.sub;

    if (!userId) {
      throw new BadRequestException('User ID could not be extracted from Auth token');
    }

    return this.dashboardService.getDashboardOverview(userId, query.limit);
  }
}