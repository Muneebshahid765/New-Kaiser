import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { SubmitReviewDto, CanReviewDto, GetProductReviewsDto } from '../dto/buyer-review.dto';
import { ReviewStatus, OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class BuyerReviewService {
  private readonly logger = new Logger(BuyerReviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  private normalizeEmail(email?: string | null): string {
    return (email || '').trim().toLowerCase();
  }

  private async resolveProductId(identifier: string): Promise<string> {
    const cleanIdentifier = identifier.trim();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        cleanIdentifier,
      );

    const product = await this.prisma.product.findFirst({
      where: isUuid ? { id: cleanIdentifier } : { slug: cleanIdentifier },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException({
        success: false,
        message: 'Product not found',
      });
    }

    return product.id;
  }

  private async validateOrderEligibility(
    orderId: string,
    email: string,
    productId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException({ success: false, message: 'Order not found' });
    }

    const dbEmail = this.normalizeEmail(order.customerEmail);
    const reqEmail = this.normalizeEmail(email);

    if (dbEmail !== reqEmail) {
      this.logger.warn(
        `Email Mismatch for Order '${orderId}'. DB Email: '${order.customerEmail}' | Request Email: '${email}'`,
      );
      throw new ForbiddenException({
        success: false,
        message: 'Invalid order or email. Please check the email used during checkout.',
      });
    }

    if (order.orderStatus !== OrderStatus.delivered) {
      throw new BadRequestException({
        success: false,
        message: 'You can only review delivered orders',
      });
    }

    const hasProduct = order.items.some((item) => item.productId === productId);
    if (!hasProduct) {
      throw new BadRequestException({
        success: false,
        message: 'Product not found in this order',
      });
    }

    return order;
  }

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

  async submitReview(dto: SubmitReviewDto) {
    const { productId: slugOrId, orderId, email, userName, rating, comment } = dto;

    const productId = await this.resolveProductId(slugOrId);
    const order = await this.validateOrderEligibility(orderId, email, productId);

    const existingReview = await this.prisma.review.findFirst({
      where: { productId, orderId },
    });

    if (existingReview) {
      throw new ConflictException({
        success: false,
        message: 'You have already submitted a review for this order',
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          productId,
          orderId,
          userName: userName.trim(),
          userEmail: this.normalizeEmail(email),
          rating,
          comment: comment.trim(),
          buyerProfileId: order.buyerProfileId,
          status: ReviewStatus.approved,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          reviewSubmitted: true,
          reviewSubmittedAt: new Date(),
        },
      });

      await this.updateProductRating(productId, tx);

      return {
        success: true,
        message: 'Thank you for your review!',
        review: {
          _id: review.id,
          userName: review.userName,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        },
      };
    });
  }

  async getProductReviews(
    identifier: string,
    dto: GetProductReviewsDto,
    skipExistenceCheck = false,
  ) {
    const { cursor, limit = 5 } = dto;

    const productId = skipExistenceCheck
      ? identifier
      : await this.resolveProductId(identifier);

    const takeLimit = limit + 1;
    const reviews = await this.prisma.review.findMany({
      where: { productId, status: ReviewStatus.approved },
      take: takeLimit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userName: true,
        rating: true,
        comment: true,
        createdAt: true,
        buyerProfile: { select: { id: true } },
      },
    });

    let nextCursor: string | null = null;
    let hasMore = false;

    if (reviews.length > limit) {
      hasMore = true;
      const nextItem = reviews.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return {
      data: reviews,
      meta: { nextCursor, hasMore, limit },
    };
  }

  /**
   * Fetches product snapshot AND pre-populates customer Email & Name from Order
   */

async getProductForReview(identifier: string, orderId?: string) {
  const productId = await this.resolveProductId(identifier);

  let customerEmail: string | null = null;
  let customerName: string | null = null;
  let alreadyReviewed = false;

  if (orderId) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        customerEmail: true,
        customerName: true,
        items: {
          where: { productId },
          select: { productName: true, price: true, productImage: true },
        },
      },
    });

    if (order) {
      customerEmail = order.customerEmail;
      customerName = order.customerName;

      // Direct check in DB: Kya is orderId aur productId ka review pehle se exist karta hai?
      const existingReview = await this.prisma.review.findFirst({
        where: { productId, orderId },
        select: { id: true },
      });

      alreadyReviewed = !!existingReview;

      const item = order.items[0];
      if (item) {
        return {
          success: true,
          product: {
            name: item.productName,
            price: item.price,
            image: item.productImage,
          },
          customerEmail,
          customerName,
          alreadyReviewed,
          canReview: !alreadyReviewed,
        };
      }
    }
  }

  const product = await this.prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, price: true, images: { take: 1, select: { url: true } } },
  });

  return {
    success: true,
    product: {
      name: product?.name || '',
      price: product?.price || 0,
      image: product?.images[0]?.url || null,
    },
    customerEmail: null,
    customerName: null,
    alreadyReviewed: false,
    canReview: true,
  };
}


  async canReview(dto: CanReviewDto) {
  const { productId: identifier, email, orderId } = dto;
  const productId = await this.resolveProductId(identifier);

  // 1. Order-level duplicate review check
  if (orderId) {
    const existingReview = await this.prisma.review.findFirst({
      where: { productId, orderId },
    });

    if (existingReview) {
      return {
        success: true,
        canReview: false,
        alreadyReviewed: true,
        message: 'Aap is order ka review pehle hi submit kar chuke hain.',
      };
    }

    // 2. Eligibility & status check (Delivered check etc)
    if (email) {
      await this.validateOrderEligibility(orderId, email, productId);
    }
  }

  return {
    success: true,
    canReview: true,
    message: 'You can review this product',
  };
}
 
}