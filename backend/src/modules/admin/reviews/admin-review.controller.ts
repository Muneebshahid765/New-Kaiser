import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewService } from './admin-review.service';
import { ReviewReminderService } from './review-reminder.service';
import {

 type  QueryAdminReviewsDto,
  QueryAdminReviewsSchema,
 type UpdateReviewStatusDto,
  UpdateReviewStatusSchema,
} from '../dto/reviews.dto';

// Standard Auth & Role Guards
import { AppRole, Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';

  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN)
@Controller('admin/reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly reviewReminderService: ReviewReminderService,
  ) {}



  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

  @Get('all')
  async getAllReviewsAdmin(
    @Query(ZodValidationPipe.for(QueryAdminReviewsSchema)) query: QueryAdminReviewsDto,
  ) {
    return this.reviewService.getAllReviewsAdmin(query);
  }

  @Delete(':reviewId')
  async deleteReview(@Param('reviewId', ParseUUIDPipe) reviewId: string) {
    return this.reviewService.deleteReview(reviewId);
  }

  @Patch(':reviewId/status')

  async updateStatus(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Body(ZodValidationPipe.for(UpdateReviewStatusSchema)) dto: UpdateReviewStatusDto,
  ) {
    return this.reviewService.updateStatus(reviewId, dto);
  }

  @Post('test-reminder/:orderId')
  @HttpCode(HttpStatus.OK)

  async testReminder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    const success = await this.reviewReminderService.sendImmediateReviewReminder(orderId);
    return {
      success,
      message: success
        ? 'Review reminder email sent successfully'
        : 'Failed to send review reminder email',
    };
  }
}