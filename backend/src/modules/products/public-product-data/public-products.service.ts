/*eslint-disable*/
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { ProductStatus, Prisma } from '@prisma/client';
import { isUUID, calculateGlobalDiscount, fetchActiveSiteWideDiscount } from '../../../common/utils';
import { CacheService } from 'src/core/cache/redis/cache.service';
import { calculateProductScore } from 'src/common/utils/product-score.util';
import { GetProductsFilter } from '../dto/filter.dto';
import { BuyerReviewService } from 'src/modules/buyer/reviews/buyer-reviews.service';
import { GetProductReviewsDto } from 'src/modules/buyer/dto/buyer-review.dto';

@Injectable()
export class PublicProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly  cacheService : CacheService,
    private readonly reviewService : BuyerReviewService
  ) {}






async getFilteredProducts(filterDto: GetProductsFilter) {
  const page  = Number(filterDto.page)  || 1
  const limit = Number(filterDto.limit) || 25
  const skip  = (page - 1) * limit

  const cacheKey = `products:filtered:${JSON.stringify(filterDto)}`
  const cached   = await this.cacheService.get(cacheKey)
  if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached

  const where: Prisma.ProductWhereInput = { status: 'active', deleted: false }

  // Category
  if (filterDto.category?.trim()) {
    where.category = {
      OR: [
        { id:   filterDto.category },
        { slug: filterDto.category },
        { name: { equals: filterDto.category, mode: 'insensitive' } },
      ],
    }
  }

  // Search
  if (filterDto.search?.trim()) {
    where.OR = [
      { name:        { contains: filterDto.search.trim(), mode: 'insensitive' } },
      { description: { contains: filterDto.search.trim(), mode: 'insensitive' } },
      { sku:         { contains: filterDto.search.trim(), mode: 'insensitive' } },
    ]
  }

  // Price
  if (filterDto.minPrice || filterDto.maxPrice) {
    where.price = {}
    if (filterDto.minPrice) where.price.gte = parseFloat(String(filterDto.minPrice))
    if (filterDto.maxPrice) where.price.lte = parseFloat(String(filterDto.maxPrice))
  }

  // Stock
  if (filterDto.stockFilter === 'instock')    where.stockQuantity = { gt: 0 }
  if (filterDto.stockFilter === 'outofstock') where.stockQuantity = { lte: 0 }
  if (filterDto.stockFilter === 'lowstock')   where.stockQuantity = { gt: 0, lte: 5 }

  // On Sale  ← ✅ fix: block properly closed
   if (filterDto.onSale === true) {
  where.originalPrice = { not: null }
}
if (filterDto.minRating) {
  where.averageRating = { gte: filterDto.minRating }
}
  

  // Sort
  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [
    { totalReviews: 'desc' },
    { averageRating: 'desc' },
    { createdAt: 'desc' },
  ]
  switch (filterDto.sort) {
    case '-createdAt': orderBy = [{ createdAt: 'desc' }]; break
    case  'createdAt': orderBy = [{ createdAt: 'asc'  }]; break
    case    '-price':  orderBy = [{ price: 'desc'     }]; break
    case     'price':  orderBy = [{ price: 'asc'      }]; break
  }

  const [rawProducts, totalCount] = await Promise.all([
    this.prisma.product.findMany({
      where, orderBy, skip, take: limit,
      select: {
        id: true, name: true, slug: true, sku: true,
        price: true, originalPrice: true, stockQuantity: true,
        averageRating: true, totalReviews: true, createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
        images:   { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true, title: true } },
        labels:   { orderBy: { sortOrder: 'asc' },          select: { text: true, variant: true } },
      },
    }),
    this.prisma.product.count({ where }),
  ])

  const activeDiscount = await fetchActiveSiteWideDiscount(this.prisma)
  const products = rawProducts.map((p) => calculateGlobalDiscount(p, activeDiscount))

  const response = {
    success: true,
    products,
    pagination: { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) },
  }

  await this.cacheService.setex(cacheKey, 120, JSON.stringify(response))
  return response
}
  // Refactored getFeaturedProducts to use the SAME reusable score function
 async getFeaturedProducts() {
  const cacheKey = 'products:featured:top5';
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached;

  // 1. Light query: Sirf scoring ke liye zaroori columns fetch karein
  const rawProducts = await this.prisma.product.findMany({
    where: { status: 'active', deleted: false },
    select: {
      id: true,
      averageRating: true,
      totalReviews: true,
      createdAt: true,
    },
    take: 30,
  });

  const now = new Date().getTime();
  
  // 2. Score calculation & top 5 selection
  const top5Ids = rawProducts
    .map((p) => ({ id: p.id, score: calculateProductScore(p, now) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.id);

  if (top5Ids.length === 0) return { success: true, data: [] };

  // 3. Full details strictly for Top 5 items only
  const fullProducts = await this.prisma.product.findMany({
    where: { id: { in: top5Ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      price: true,
      originalPrice: true,
      stockQuantity: true,
      averageRating: true,
      totalReviews: true,
      category: { select: { id: true, name: true, slug: true } },
      images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true, title: true } },
      labels: { orderBy: { sortOrder: 'asc' }, select: { text: true, variant: true } },
    },
  });

  const activeDiscount = await fetchActiveSiteWideDiscount(this.prisma, this.cacheService);
  const transformedProducts = fullProducts.map((p) => calculateGlobalDiscount(p, activeDiscount));

  const response = { success: true, data: transformedProducts };
  await this.cacheService.setex(cacheKey, 600, JSON.stringify(response));

  return response;
}

  // ─── Similar Products — same category, current product exclude ────────────────
async getSimilarProducts(productId: string, categoryId: string) {
    const cacheKey = `products:similar:${productId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached;

    const rawProducts = await this.prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        status: ProductStatus.active,
        deleted: false,
      },
      take: 4,
      // Fixed Order to align with DB Index @@index([status, deleted, averageRating(sort: Desc), totalReviews(sort: Desc)])
      orderBy: [
        { averageRating: 'desc' },
        { totalReviews: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        stockQuantity: true,
        averageRating: true,
        totalReviews: true,
        category: { select: { id: true, name: true, slug: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true, title: true } },
        labels: { orderBy: { sortOrder: 'asc' }, select: { text: true, variant: true } },
      },
    });

    const discount = await fetchActiveSiteWideDiscount(this.prisma, this.cacheService);
    const products = rawProducts.map((p) => calculateGlobalDiscount(p, discount));

    const response = { success: true, products, total: products.length };
    await this.cacheService.setex(cacheKey, 300, JSON.stringify(response));

    return response;
  }



async getPublicProductDetails(param: string, reviewDto: GetProductReviewsDto) {
    const productCacheKey = `products:public:${param}`;
    const cached = await this.cacheService.get(productCacheKey);

    let transformedProduct: any;
    let productId: string;
    let categoryId: string;

    if (cached) {
      transformedProduct = typeof cached === 'string' ? JSON.parse(cached) : cached;
      productId = transformedProduct.id;
      categoryId = transformedProduct.categoryId;
    } else {
      const isId = isUUID(param);
      const raw = await this.prisma.product.findFirst({
        where: isId
          ? { id: param, deleted: false, status: ProductStatus.active }
          : { slug: param, deleted: false, status: ProductStatus.active },
        // Exact Prisma Schema Projection Fixes:
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          originalPrice: true,
          stockQuantity: true,
          averageRating: true,
          totalReviews: true,
          deliveryCharges: true,
          deliveryRule: true,
          insuranceDetails: true,
          usageInstructions: true,
          features: true,
          highlights: true,
          specifications: true,
          categoryId: true,
          category: { select: { id: true, name: true, slug: true } },
          images: {
            select: { url: true, title: true, sortOrder: true },
            orderBy: { sortOrder: 'asc' },
          },
          labels: {
            select: { text: true, variant: true, sortOrder: true },
            orderBy: { sortOrder: 'asc' },
          },
          packageContents: {
            select: { name: true, description: true, sortOrder: true }, // FIXED: 'name' instead of 'text'
            orderBy: { sortOrder: 'asc' },
          },
          attributes: {
            select: { name: true, value: true, unit: true, sortOrder: true }, // FIXED: 'name' instead of 'key'
            orderBy: { sortOrder: 'asc' },
          },
          benefits: {
            select: { title: true, description: true, icon: true, learnMoreUrl: true, sortOrder: true },
            orderBy: { sortOrder: 'asc' },
          },
          faqs: {
            select: { question: true, answer: true, sortOrder: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      if (!raw) throw new NotFoundException('Product not found');

      const discount = await fetchActiveSiteWideDiscount(this.prisma, this.cacheService);
      transformedProduct = calculateGlobalDiscount(raw, discount);
      productId = raw.id;
      categoryId = raw.categoryId;

      await this.cacheService.setex(productCacheKey, 300, JSON.stringify(transformedProduct));
    }

    // Parallel DB Calls (Skip redundant product existence check for reviews)
    const [reviewsData, similarData] = await Promise.all([
      this.reviewService.getProductReviews(productId, reviewDto, true),
      this.getSimilarProducts(productId, categoryId),
    ]);

    return {
      success: true,
      product: transformedProduct,
      reviews: reviewsData,
      similar: similarData,
    };
  }

}