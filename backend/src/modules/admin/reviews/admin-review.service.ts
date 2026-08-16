import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';// Assume PrismaService module exists

import { QueryAdminReviewsDto, UpdateReviewStatusDto } from '../dto/reviews.dto';
import { ReviewStatus, Prisma } from '@prisma/client';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recalculates product rating and updates total count aggregate
   */
  async updateProductRating(productId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx || this.prisma;

    const aggregation = await db.review.aggregate({
      where: { productId, status: ReviewStatus.approved },
      _avg: { rating: true },
      _count: { id: true },
    });

    const averageRating = new Prisma.Decimal(aggregation._avg.rating || 0);
    const totalReviews = aggregation._count.id;

    await db.product.update({
      where: { id: productId },
      data: { averageRating, totalReviews },
    });
  }

  /**
   * Admin: Paginated review moderation query
   */
  async getAllReviewsAdmin(query: QueryAdminReviewsDto) {
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: { product: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      success: true,
      reviews: reviews.map((r) => ({
        ...r,
        productName: r.product?.name || 'Unknown Product',
      })),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  /**
   * Admin: Hard delete review record
   */
  async deleteReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException({ success: false, message: 'Review not found' });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await this.updateProductRating(review.productId, tx);
    });

    return { success: true, message: 'Review deleted successfully' };
  }

  /**
   * Admin: Patch status (approved / rejected / pending)
   */
  async updateStatus(reviewId: string, dto: UpdateReviewStatusDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException({ success: false, message: 'Review not found' });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.review.update({
        where: { id: reviewId },
        data: { status: dto.status },
      });

      await this.updateProductRating(review.productId, tx);
      return res;
    });

    return { success: true, message: 'Review status updated', review: updated };
  }
}