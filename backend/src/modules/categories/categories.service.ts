/*eslint-disable*/
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CacheService } from 'src/core/cache/redis/cache.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoryDto,
  BulkDeleteCategoryDto,
  BulkStatusCategoryDto,
} from './category.dto';
import {
  CategoryStatus,
  ImageFolder,
  UsageModel,
  ImageAsset,
  ProductStatus,
} from '@prisma/client';
import { generateSlug } from '../../common/utils/slug.util';
import { ImageDedupService } from '../uploads/services/image.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly imageService: ImageDedupService,
  ) {}

  private async clearCategoryAndProductCache() {
    await Promise.all([
      this.cacheService.delByPattern('categories:*'),
      this.cacheService.delByPattern('products:*'),
    ]);
  }

  /**
   * Pure Prisma implementation for fetching categories with aggregated product statistics
   */
  async findAll(query: QueryCategoryDto) {
    const { status, page = 1, limit = 50 } = query;
    const whereCondition: any = { slug: { not: 'uncategorized' } };

    if (status && status !== 'all') {
      whereCondition.status = status as CategoryStatus;
    } else {
      whereCondition.status = CategoryStatus.active;
    }

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * perPage;

    const [categories, totalCount] = await Promise.all([
      this.prisma.category.findMany({
        where: whereCondition,
        skip,
        take: perPage,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          image: { select: { id: true, path: true } },
          products: {
            where: { deleted: false },
            select: {
              id: true,
              status: true,
              stockQuantity: true,
              price: true,
              averageRating: true,
              totalReviews: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where: whereCondition }),
    ]);

    if (!categories.length) {
      return {
        success: true,
        count: 0,
        data: [],
        pagination: { total: 0, totalPages: 1, currentPage, limit: perPage },
      };
    }

    // Pure JS/TS aggregation over Prisma relations
    const enriched = categories
      .map(({ products, ...cat }) => {
        const productCount = products.length;
        const activeProductCount = products.filter(
          (p) => p.status === ProductStatus.active,
        ).length;

        const totalRating = products.reduce(
          (acc, p) => acc + Number(p.averageRating || 0),
          0,
        );
        const avgRating =
          productCount > 0 ? +(totalRating / productCount).toFixed(1) : 0;

        const totalReviews = products.reduce(
          (acc, p) => acc + Number(p.totalReviews || 0),
          0,
        );
        const totalStock = products.reduce(
          (acc, p) => acc + Number(p.stockQuantity || 0),
          0,
        );

        const totalPrice = products.reduce(
          (acc, p) => acc + Number(p.price || 0),
          0,
        );
        const avgPrice =
          productCount > 0 ? +(totalPrice / productCount).toFixed(2) : 0;

        const outOfStockCount = products.filter(
          (p) => p.stockQuantity === 0,
        ).length;
        const lowStockCount = products.filter(
          (p) => p.stockQuantity > 0 && p.stockQuantity <= 5,
        ).length;

        return {
          ...cat,
          productCount,
          activeProductCount,
          avgRating,
          totalReviews,
          totalStock,
          avgPrice,
          outOfStockCount,
          lowStockCount,
        };
      })
      .sort((a, b) => b.productCount - a.productCount);

    return {
      success: true,
      count: enriched.length,
      data: enriched,
      pagination: {
        total: totalCount,
        totalPages: Math.ceil(totalCount / perPage),
        currentPage,
        limit: perPage,
      },
    };
  }

  /**
   * Home Page Featured Top 4 Categories (Pure Prisma implementation)
   */
  /**
   * Home Page Featured Top 4 Categories (Pure Prisma implementation)
   */
  async getFeaturedCategories() {
    const cacheKey = 'categories:featured:top4';

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }

    const categories = await this.prisma.category.findMany({
      where: {
        status: CategoryStatus.active,
        slug: { not: 'uncategorized' },
      },
      include: {
        image: {
          select: {
            id: true,
            path: true,
            folder: true,
          },
        },
        products: {
          where: { deleted: false },
          select: {
            status: true,
            stockQuantity: true,
            averageRating: true,
            totalReviews: true,
          },
        },
      },
    });

    if (!categories.length) {
      return { success: true, count: 0, data: [] };
    }

    const rankedCategories = categories
      .map(({ products, ...cat }) => {
        const productCount = products.length;
        const activeInStockCount = products.filter(
          (p) => p.status === ProductStatus.active && p.stockQuantity > 0,
        ).length;

        // FIXED: Explicitly cast Decimal to Number
        const totalRating = products.reduce(
          (acc, p) => acc + (p.averageRating ? Number(p.averageRating) : 0),
          0,
        );
        const avgRating =
          productCount > 0 ? +(totalRating / productCount).toFixed(1) : 0;

        const totalReviews = products.reduce(
          (acc, p) => acc + (p.totalReviews || 0),
          0,
        );
        const totalStock = products.reduce(
          (acc, p) => acc + (p.stockQuantity || 0),
          0,
        );

        // Popularity Ranking Algorithm
        const stockHealthScore = activeInStockCount * 15;
        const catalogScore = productCount * 5;
        const reviewScore = Math.min(totalReviews * 2, 60);
        const ratingScore = avgRating * 10;

        const compositeScore =
          stockHealthScore + catalogScore + reviewScore + ratingScore;

        return {
          category: {
            ...cat,
            productCount,
            activeInStockCount,
            avgRating,
            totalReviews,
            totalStock,
          },
          score: compositeScore,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.category);

    const response = {
      success: true,
      count: rankedCategories.length,
      data: rankedCategories,
    };

    await this.cacheService.setex(cacheKey, 900, JSON.stringify(response));

    return response;
  }

  async getDropdownList() {
    return this.prisma.category.findMany({
      where: {
        status: CategoryStatus.active,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { image: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return { success: true, data: category };
  }

  async create(dto: CreateCategoryDto, file?: Express.Multer.File) {
    const name = dto.name.trim();
    const exists = await this.prisma.category.findUnique({ where: { name } });
    if (exists) throw new BadRequestException('Category name already exists');

    const category = await this.prisma.$transaction(async (tx) => {
      let imageAsset: ImageAsset | null = null;
      if (file) {
        const result = await this.imageService.processAndDedup(
          file.buffer,
          ImageFolder.categories,
          tx,
        );
        imageAsset = result.asset;
      }

      const created = await tx.category.create({
        data: {
          name,
          slug: generateSlug(name),
          description: dto.description.trim(),
          status: dto.status as CategoryStatus,
          imageId: imageAsset ? imageAsset.id : null,
        },
      });

      if (imageAsset) {
        await this.imageService.addUsageRef(
          imageAsset.id,
          UsageModel.category,
          created.id,
          'image',
          tx,
        );
      }
      return created;
    });

    await this.clearCategoryAndProductCache();
    const populated = await this.prisma.category.findUnique({
      where: { id: category.id },
      include: { image: true },
    });

    return {
      success: true,
      message: 'Category created successfully',
      data: populated,
    };
  }

  async update(id: string, dto: UpdateCategoryDto, file?: Express.Multer.File) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const newName = dto.name ? dto.name.trim() : category.name;
    if (newName !== category.name) {
      const dup = await this.prisma.category.findFirst({
        where: { name: newName, id: { not: id } },
      });
      if (dup) throw new BadRequestException('Category name already in use');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      let newImageAsset: ImageAsset | null = null;
      if (file) {
        const newResult = await this.imageService.processAndDedup(
          file.buffer,
          ImageFolder.categories,
          tx,
        );
        newImageAsset = newResult.asset;
      }

      if (file && category.imageId) {
        await this.imageService.releaseImageRef(
          category.imageId,
          UsageModel.category,
          id,
          'image',
          tx,
        );
      }

      const res = await tx.category.update({
        where: { id },
        data: {
          name: newName,
          slug:
            newName !== category.name ? generateSlug(newName) : category.slug,
          description: dto.description
            ? dto.description.trim()
            : category.description,
          status: (dto.status as CategoryStatus) || category.status,
          imageId: newImageAsset ? newImageAsset.id : category.imageId,
        },
        include: { image: true },
      });

      if (newImageAsset) {
        await this.imageService.addUsageRef(
          newImageAsset.id,
          UsageModel.category,
          id,
          'image',
          tx,
        );
      }
      return res;
    });

    await this.clearCategoryAndProductCache();
    return {
      success: true,
      message: 'Category updated successfully',
      data: updated,
    };
  }

  async delete(id: string, force: boolean) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const productCount = await this.prisma.product.count({
      where: { categoryId: id, deleted: false },
    });

    if (productCount > 0 && !force) {
      throw new ConflictException({
        success: false,
        message: `Cannot delete: ${productCount} products are using this category.`,
        productCount,
        canForce: true,
      });
    }

    await this.prisma.$transaction(async (tx) => {
      if (productCount > 0 && force) {
        let uncategorized = await tx.category.findUnique({
          where: { slug: 'uncategorized' },
        });
        if (!uncategorized) {
          uncategorized = await tx.category.create({
            data: {
              name: 'Uncategorized',
              slug: 'uncategorized',
              description: 'Fallback category for orphaned products',
              status: CategoryStatus.inactive,
            },
          });
        }
        await tx.product.updateMany({
          where: { categoryId: id, deleted: false },
          data: { categoryId: uncategorized.id },
        });
      }

      if (category.imageId) {
        await this.imageService.releaseImageRef(
          category.imageId,
          UsageModel.category,
          id,
          'image',
          tx,
        );
      }

      await tx.category.delete({ where: { id } });
    });

    await this.clearCategoryAndProductCache();
    return { success: true, message: 'Category deleted successfully' };
  }

  async bulkDelete(dto: BulkDeleteCategoryDto) {
    const { ids, force = false } = dto;
    const categories = await this.prisma.category.findMany({
      where: { id: { in: ids } },
    });
    if (!categories.length) throw new NotFoundException('No categories found');

    const categoryIds = categories.map((c) => c.id);

    await this.prisma.$transaction(async (tx) => {
      if (force) {
        let uncategorized = await tx.category.findUnique({
          where: { slug: 'uncategorized' },
        });
        if (!uncategorized) {
          uncategorized = await tx.category.create({
            data: {
              name: 'Uncategorized',
              slug: 'uncategorized',
              description: 'Fallback category',
              status: CategoryStatus.inactive,
            },
          });
        }
        await tx.product.updateMany({
          where: { categoryId: { in: categoryIds }, deleted: false },
          data: { categoryId: uncategorized.id },
        });
      }

      for (const cat of categories) {
        if (cat.imageId) {
          await this.imageService.releaseImageRef(
            cat.imageId,
            UsageModel.category,
            cat.id,
            'image',
            tx,
          );
        }
      }

      await tx.category.deleteMany({ where: { id: { in: categoryIds } } });
    });

    await this.clearCategoryAndProductCache();
    return {
      success: true,
      message: `${categories.length} categories deleted successfully`,
    };
  }

  async bulkUpdateStatus(dto: BulkStatusCategoryDto) {
    const result = await this.prisma.category.updateMany({
      where: { id: { in: dto.ids } },
      data: { status: dto.status as CategoryStatus },
    });

    await this.clearCategoryAndProductCache();
    return {
      success: true,
      message: `${result.count} categories updated to ${dto.status}`,
    };
  }
}
