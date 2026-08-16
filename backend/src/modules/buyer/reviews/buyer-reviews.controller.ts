import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BuyerReviewService } from './buyer-reviews.service';

import { type CanReviewDto, CanReviewSchema, type GetProductReviewsDto,  getProductReviewsSchema,  type SubmitReviewDto, SubmitReviewSchema } from '../dto/buyer-review.dto';
import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';
import { Public } from 'src/common/decorators/public.decorator';




@Controller('buyer/reviews')
export class BuyerReviewController {
  constructor(
    private readonly reviewService: BuyerReviewService,
  ) {}


  @Public()
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidationPipe.for(SubmitReviewSchema))
  async submitReview(@Body() dto: SubmitReviewDto) {
    return this.reviewService.submitReview(dto);
  }

// 1. Fetch Product Reviews via Slug or UUID
@Public()
@Get('product/:identifier')
@HttpCode(HttpStatus.OK)
async getProductReviews(
  @Param('identifier') identifier: string, // UUID or Slug accepted
  @Query(ZodValidationPipe.for(getProductReviewsSchema))
  dto: GetProductReviewsDto,
) {
  return this.reviewService.getProductReviews(identifier, dto);
}

// 2. Fetch Product Snapshots for Review UI
@Public()
@Get('product-for-review/:identifier')
async getProductForReview(
  @Param('identifier') identifier: string,
  @Query('orderId') orderId?: string,
) {
  return this.reviewService.getProductForReview(identifier, orderId);
}

  @Public()
  @Post('can-review')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidationPipe.for(CanReviewSchema))
  async canReview(@Body() dto: CanReviewDto) {
    return this.reviewService.canReview(dto);
  }


}