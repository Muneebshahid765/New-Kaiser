/*eslint-disable*/
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { ImageDedupService } from '../uploads/services/image.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { UsageModel, CategoryStatus, ProductStatus, Prisma } from '@prisma/client';
import { isUUID, calculateGlobalDiscount, fetchActiveSiteWideDiscount } from '../../common/utils';
import slugify from 'slugify';
import { CacheService } from 'src/core/cache/redis/cache.service';
import { BulkUpdateProductDto } from './dto/bulk-update-product.dto';


type PrismaTx = Prisma.TransactionClient;
@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageDedupService: ImageDedupService,
    private readonly  cacheService : CacheService
  ) {}

  private generateSlug(name: string): string {
    return slugify(name, { lower: true, strict: true, trim: true });
  }

 private normalizeSpecifications(specifications: any): Record<string, string> {
  if (!specifications) return {};

  let parsed = specifications;

  // Agar stringified JSON aaye (multipart form-data se)
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return {};
    }
  }

  // Agar Array aaye: [{ name: "Material", value: "Cotton" }] ya [{ key: "Material", value: "Cotton" }]
  if (Array.isArray(parsed)) {
    const result: Record<string, string> = {};
    for (const item of parsed) {
      if (item && typeof item === 'object') {
        const specName = item.name || item.key;
        if (specName && String(specName).trim() !== '') {
          result[String(specName).trim()] = String(item.value ?? '');
        }
      }
    }
    return result;
  }

  // Agar pehle se Object ho: { "Material": "Cotton" }
  if (typeof parsed === 'object' && parsed !== null) {
    return parsed;
  }

  return {};
} 


private async bulkUpdateRelations(
  tx: PrismaTx,
  productIds: string[],
  labels: Array<{ text: string; variant: any; sortOrder?: number }> | undefined,
): Promise<void> {
  // Agar labels undefined hai toh kuch mat karo (skip)
  // Agar labels empty array [] hai toh saare labels delete karo (clear)
  // Agar labels mein items hain toh delete + recreate karo
 
  if (labels === undefined) return;
 
  for (const productId of productIds) {
    // Pehle existing labels delete karo
    await tx.productLabel.deleteMany({ where: { productId } });
 
    // Agar naye labels hain toh create karo
    if (labels.length > 0) {
      await tx.productLabel.createMany({
        data: labels.map((l, idx) => ({
          productId,
          text:      l.text,
          variant:   l.variant,          // LabelVariant enum — Prisma validate karega
          sortOrder: l.sortOrder ?? idx,
        })),
      });
    }
  }
}

async createProduct(dto: CreateProductDto) {
    // 1. Verify Category Validity
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, status: CategoryStatus.active },
    });

    if (!category) {
      throw new BadRequestException('Category not found or inactive');
    }

    // 2. Slug logic and uniqueness checks
    let slug = dto.slug || this.generateSlug(dto.name);
    const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const existingSku = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existingSku) {
      throw new ConflictException(`SKU '${dto.sku}' is already registered`);
    }

    const formattedSpecifications = this.normalizeSpecifications(dto.specifications);

  const newProduct = await this.prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: dto.name,
        slug: slug,
        sku: dto.sku,
        description: dto.description,
        price: dto.price,
        originalPrice: dto.originalPrice ?? null,
        categoryId: dto.categoryId,
        stockQuantity: dto.stockQuantity,
        status: dto.status,
        deliveryCharges: dto.deliveryCharges,
        deliveryRule: dto.deliveryRule,
        insuranceDetails: dto.insuranceDetails,
        usageInstructions: dto.usageInstructions,
        adminNotes: dto.adminNotes,

        // 👈 FIX: Har format ko clean { "Material": "Cotton" } Object mein store karega
        specifications: formattedSpecifications,

        features: dto.features,
        highlights: dto.highlights,

        // Nested Relational Creations...
        labels: { create: dto.labels.map((item, idx) => ({ ...item, sortOrder: item.sortOrder ?? idx })) },
        packageContents: { create: dto.packageContents.map((item, idx) => ({ ...item, sortOrder: item.sortOrder ?? idx })) },
        attributes: { create: dto.attributes.map((item, idx) => ({ ...item, sortOrder: item.sortOrder ?? idx })) },
        benefits: { create: dto.benefits.map((item, idx) => ({ ...item, sortOrder: item.sortOrder ?? idx })) },
        faqs: { create: dto.faqs.map((item, idx) => ({ ...item, sortOrder: item.sortOrder ?? idx })) },
        images: {
          create: dto.images.map((img, idx) => ({
            imageId: img.imageId || '',
            url: img.url,
            title: img.title || '',
            description: img.description || '',
            sortOrder: img.sortOrder ?? idx,
          })),
        },
      },
      include: {
        images: true,
        labels: true,
        packageContents: true,
        attributes: true,
        benefits: true,
        faqs: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

      // 4. Track Image Asset Usages using transaction (tx)
      if (dto.images && dto.images.length > 0) {
        for (const img of dto.images) {
          if (img.imageId) { // 👈 Strict string guard
            await this.imageDedupService.addUsageRef(
              img.imageId,
              UsageModel.product,
              product.id,
              'images',
              tx,
            );
          }
        }
      }

      return product;
    });

    await this.cacheService.delByPattern('products:list:*');

    return {
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    };
  }


async updateProduct(id: string, dto: UpdateProductDto) {
  const oldProduct = await this.prisma.product.findFirst({
    where: { id, deleted: false },
    include: { images: true, category: true },
  });

  if (!oldProduct) {
    throw new NotFoundException('Product not found');
  }

  // Category Validation
  if (dto.categoryId) {
    const cat = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, status: CategoryStatus.active },
    });
    if (!cat) {
      throw new BadRequestException('Category not found or inactive');
    }
  }

  // Status Validation
  const targetStatus = dto.status || oldProduct.status;
  if (targetStatus === ProductStatus.active) {
    const targetCategoryId = dto.categoryId || oldProduct.categoryId;
    const cat = await this.prisma.category.findUnique({
      where: { id: targetCategoryId },
    });
    const isUncategorized =
      !cat ||
      cat.slug === 'uncategorized' ||
      cat.name.toLowerCase() === 'uncategorized';

    if (isUncategorized) {
      throw new BadRequestException(
        'Cannot activate product with "Uncategorized" category. Assign a valid category first.',
      );
    }
  }

  const updatedProduct = await this.prisma.$transaction(async (tx) => {

// ─────────────────────────────────────────────────────────────────────
// STEP A: IMAGE RECONCILIATION
// ─────────────────────────────────────────────────────────────────────
if (dto.images !== undefined) {
  const incomingImageIds = dto.images
    .map((img) => img.imageId)
    .filter((imgId): imgId is string => Boolean(imgId));

  const removedImages = oldProduct.images.filter(
    (oldImg) => !incomingImageIds.includes(oldImg.imageId),
  );

  for (const removedImg of removedImages) {
    // 👈 1. PEHLE ProductImage record delete karein taake Foreign Key release ho jaye
    await tx.productImage.delete({ where: { id: removedImg.id } });

    // 👈 2. PHIR releaseImageRef call karein (ab imageAsset delete ho sakega agar usage 0 ho gaya)
    if (removedImg.imageId) {
      await this.imageDedupService.releaseImageRef(
        removedImg.imageId,
        UsageModel.product,
        id,
        'images',
        tx,
      );
    }
  }

  for (let i = 0; i < dto.images.length; i++) {
    const imgPayload = dto.images[i];
    const imageId = imgPayload.imageId || '';
    const existingImg = oldProduct.images.find((o) => o.imageId === imageId);

    if (existingImg) {
      await tx.productImage.update({
        where: { id: existingImg.id },
        data: {
          title: imgPayload.title,
          description: imgPayload.description,
          sortOrder: imgPayload.sortOrder ?? i,
        },
      });
    } else {
      if (imageId) {
        await this.imageDedupService.addUsageRef(
          imageId,
          UsageModel.product,
          id,
          'images',
          tx,
        );
      }
      await tx.productImage.create({
        data: {
          productId: id,
          imageId,
          url: imgPayload.url,
          title: imgPayload.title || '',
          description: imgPayload.description || '',
          sortOrder: imgPayload.sortOrder ?? i,
        },
      });
    }
  }
}
    // ─────────────────────────────────────────────────────────────────────
    // STEP B: RELATIONAL COLLECTIONS UPDATE
    // ─────────────────────────────────────────────────────────────────────
    // Labels
    if (dto.labels !== undefined) {
      await tx.productLabel.deleteMany({ where: { productId: id } });
      if (dto.labels.length > 0) {
        await tx.productLabel.createMany({
          data: dto.labels.map((item, idx) => ({
            productId: id,
            text: item.text,
            variant: item.variant,
            sortOrder: item.sortOrder ?? idx,
          })),
        });
      }
    }

    // Package Contents
    if (dto.packageContents !== undefined) {
      await tx.productPackageContents.deleteMany({ where: { productId: id } });
      if (dto.packageContents.length > 0) {
        await tx.productPackageContents.createMany({
          data: dto.packageContents.map((item, idx) => ({
            productId: id,
            name: item.name,
            description: item.description ?? '',
            sortOrder: item.sortOrder ?? idx,
          })),
        });
      }
    }

    // Attributes
    if (dto.attributes !== undefined) {
      await tx.productAttributes.deleteMany({ where: { productId: id } });
      if (dto.attributes.length > 0) {
        await tx.productAttributes.createMany({
          data: dto.attributes.map((item, idx) => ({
            productId: id,
            name: item.name,
            value: item.value,
            unit: item.unit ?? '',
            description: item.description ?? '',
            sortOrder: item.sortOrder ?? idx,
          })),
        });
      }
    }

    // Benefits
    if (dto.benefits !== undefined) {
      await tx.productBenefit.deleteMany({ where: { productId: id } });
      if (dto.benefits.length > 0) {
        await tx.productBenefit.createMany({
          data: dto.benefits.map((item, idx) => ({
            productId: id,
            title: item.title,
            description: item.description,
            icon: item.icon ?? '✓',
            learnMoreUrl: item.learnMoreUrl ?? '',
            sortOrder: item.sortOrder ?? idx,
          })),
        });
      }
    }

    // FAQs
    if (dto.faqs !== undefined) {
      await tx.productFaq.deleteMany({ where: { productId: id } });
      if (dto.faqs.length > 0) {
        await tx.productFaq.createMany({
          data: dto.faqs.map((item, idx) => ({
            productId: id,
            question: item.question,
            answer: item.answer,
            sortOrder: item.sortOrder ?? idx,
          })),
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // STEP C: Core scalar fields update & Specifications normalization
    // ─────────────────────────────────────────────────────────────────────
    const updateData: any = {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      price: dto.price,
      originalPrice: dto.originalPrice,
      categoryId: dto.categoryId,
      stockQuantity: dto.stockQuantity,
      status: dto.status,
      deliveryCharges: dto.deliveryCharges,
      deliveryRule: dto.deliveryRule,
      insuranceDetails: dto.insuranceDetails,
      usageInstructions: dto.usageInstructions,
      adminNotes: dto.adminNotes,
      features: dto.features,
      highlights: dto.highlights,
    };

    // Specifications condition check & normalization
    if (dto.specifications !== undefined) {
      updateData.specifications = this.normalizeSpecifications(dto.specifications);
    }

    const updated = await tx.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        labels: { orderBy: { sortOrder: 'asc' } },
        packageContents: { orderBy: { sortOrder: 'asc' } },
        attributes: { orderBy: { sortOrder: 'asc' } },
        benefits: { orderBy: { sortOrder: 'asc' } },
        faqs: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return updated;
  });

  await this.clearProductCache(id, updatedProduct.slug);

  return {
    success: true,
    message: 'Product updated successfully',
    product: updatedProduct,
  };
}


async adminfindOneById(param: string) {
    const cacheKey = `products:single:${param}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }

    const isId = isUUID(param);
    const whereCondition = isId
      ? { id: param, deleted: false }
      : { slug: param, deleted: false };

      const product = await this.prisma.product.findFirst({
  where: whereCondition,
  include: {
    category: { select: { id: true, name: true, slug: true } },
    images: { orderBy: { sortOrder: 'asc' } },
    labels: { orderBy: { sortOrder: 'asc' } },
    packageContents: { orderBy: { sortOrder: 'asc' } },
    attributes: { orderBy: { sortOrder: 'asc' } },
    benefits: { orderBy: { sortOrder: 'asc' } },
    faqs: { orderBy: { sortOrder: 'asc' } },
  },
});

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const discount = await fetchActiveSiteWideDiscount(this.prisma);
    const transformed = calculateGlobalDiscount(product, discount);

    const response = { success: true, product: transformed };

    await this.cacheService.setex(cacheKey, 300, JSON.stringify(response));

    return response;
}




 /**
   * Inventory List + Aggregated Header Stats
   */
  async getInventoryData(query: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  const { page, limit, search, status } = query;
  const skip = (page - 1) * limit;

  // ─── Base Filter ──────────────────────────────────────────
  const where: any = { deleted: false };

  // ─── Search Filter ────────────────────────────────────────
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { sku:  { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  // ─── Status Filter ────────────────────────────────────────
  if (status && status !== 'all') {
    if (status === 'deleted') {
      // ✅ deleted: false ko deleted: true se override karo
      where.deleted = true;
      // status constraint mat lagao — sab soft-deleted dikhao
    } else if (status === 'out-of-stock') {
      where.stockQuantity = 0;
    } else if (status === 'low-stock') {
      where.stockQuantity = { gt: 0, lte: 5 };
    } else if (Object.values(ProductStatus).includes(status as ProductStatus)) {
      // active | draft | archived
      where.status = status as ProductStatus;
    }
  }

  // ─── Main Queries (Parallel) ──────────────────────────────
  const [products, totalProducts, statsAgg] = await Promise.all([
    this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:            true,
        name:          true,
        slug:          true,
        // sku:           true,
        price:         true,
        originalPrice: true,
        stockQuantity: true,
        status:        true,
        deleted:       true,
        averageRating: true,
        totalReviews:  true,
        createdAt:     true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          select:   { id: true, url: true },
          take:     1,
          orderBy:  { sortOrder: 'asc' },
        },
      },
    }),

    this.prisma.product.count({ where }),

    // ✅ Stats hamesha global hoti hain — current filter se independent
    this.prisma.product.groupBy({
      by:    ['status'],
      where: { deleted: false },
      _count: { _all: true },
    }),
  ]);

  // ─── Stats Extract from groupBy ───────────────────────────
  const activeCount   = statsAgg.find(s => s.status === 'active')?._count._all   ?? 0;
  const draftCount    = statsAgg.find(s => s.status === 'draft')?._count._all    ?? 0;
  const archivedCount = statsAgg.find(s => s.status === 'archived')?._count._all ?? 0;

  // ─── Stock + Deleted Counts (Parallel) ───────────────────
  const [outOfStockCount, lowStockCount, deletedCount] = await Promise.all([
    this.prisma.product.count({
      where: { deleted: false, stockQuantity: 0 },
    }),
    this.prisma.product.count({
      where: { deleted: false, stockQuantity: { gt: 0, lte: 5 } },
    }),
    this.prisma.product.count({
      where: { deleted: true },
    }),
  ]);

  // ─── Response ─────────────────────────────────────────────
  return {
    success: true,
    products: products.map(p => ({ ...p, _id: p.id })),
    pagination: {
      totalProducts,
      currentPage:  page,
      totalPages:   Math.ceil(totalProducts / limit),
      limit,
    },
    stats: {
      totalProducts:    activeCount + draftCount + archivedCount,
      activeProducts:   activeCount,
      draftProducts:    draftCount,
      archivedProducts: archivedCount,
      deletedProducts:  deletedCount,
      outOfStock:       outOfStockCount,
      lowStock:         lowStockCount,
    },
  };
}



async bulkUpdate(dto: BulkUpdateProductDto) {
  const { productIds, updates } = dto;
 
  // ── Step 1: Relational fields alag karo scalar se ─────────────────────────
  //
  //  labels        → ProductLabel table  (delete + recreate per product)
  //  features      → String[] on Product  ─┐
  //  highlights    → String[] on Product   ├─ yeh scalarUpdates mein raheinge
  //  sharedFeatures→ String[] on Product  ─┘  aur updateMany se direct jaayeinge
  //
  const { labels, ...scalarUpdates } = updates;
 
  // ── Step 2: Sirf defined (non-undefined) scalar fields rakho ──────────────
  //  Taake undefined fields Prisma ko null set karne par majboor na karein
  const safeScalars = Object.fromEntries(
    Object.entries(scalarUpdates).filter(([, v]) => v !== undefined),
  ) as Omit<typeof scalarUpdates, 'labels'>;
 
  // ── Step 3: Category validate karo (agar bheja gaya ho) ───────────────────
  if (safeScalars.categoryId) {
    const category = await this.prisma.category.findUnique({
      where: { id: safeScalars.categoryId },
      select: { id: true, status: true, name: true, slug: true },
    });
 
    if (!category) {
      throw new BadRequestException(
        `Category "${safeScalars.categoryId}" nahi mili`,
      );
    }
 
    // Uncategorized category set karne ki koshish rok do
    const isUncategorized =
      category.slug === 'uncategorized' ||
      category.name.toLowerCase() === 'uncategorized';
 
    if (isUncategorized && safeScalars.status === ProductStatus.active) {
      throw new BadRequestException(
        'Uncategorized category ke saath products activate nahi ho sakte',
      );
    }
  }
 
  // ── Step 4: status=active ke liye uncategorized products check karo ────────
  //  (woh products jo pehle se uncategorized category mein hain)
  let idsToUpdate = [...productIds];
 
  if (safeScalars.status === ProductStatus.active) {
    const uncategorizedProducts = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        deleted: false,
        category: {
          OR: [
            { slug: 'uncategorized' },
            { name: { equals: 'uncategorized', mode: 'insensitive' } },
          ],
        },
      },
      select: { id: true },
    });
 
    const uncategorizedIds = new Set(uncategorizedProducts.map((p) => p.id));
 
    if (uncategorizedIds.size > 0) {
      idsToUpdate = productIds.filter((id) => !uncategorizedIds.has(id));
 
      // Sab ke sab uncategorized hain — error do
      if (idsToUpdate.length === 0) {
        throw new BadRequestException(
          `Activate nahi ho saka: saare ${uncategorizedIds.size} selected ` +
            `product(s) "Uncategorized" category mein hain. ` +
            `Pehle valid category assign karo.`,
        );
      }
 
      // Partial update: sirf valid IDs — aur warning ke saath return karo
      await this.prisma.$transaction(async (tx: PrismaTx) => {
        if (Object.keys(safeScalars).length > 0) {
          await tx.product.updateMany({
            where: { id: { in: idsToUpdate }, deleted: false },
            data: safeScalars,
          });
        }
        await this.bulkUpdateRelations(tx, idsToUpdate, labels);
      });
 
      await this.cacheService.delByPattern('products:list:*');
 
      return {
        success: true,
        warning: true,
        message:
          `${idsToUpdate.length} product(s) update ho gaye. ` +
          `${uncategorizedIds.size} skip kiye — Uncategorized category activate nahi ho sakti.`,
        matchedCount: idsToUpdate.length,
        modifiedCount: idsToUpdate.length,
        skippedCount: uncategorizedIds.size,
      };
    }
  }
 
  // ── Step 5: Full transaction — scalar + relational ────────────────────────
  const hasScalars = Object.keys(safeScalars).length > 0;
  const hasLabels  = Array.isArray(labels); // empty array bhi valid hai (clear labels)
 
  if (!hasScalars && !hasLabels) {
    throw new BadRequestException('Update ke liye kam az kam 1 field do');
  }
 
  await this.prisma.$transaction(async (tx: PrismaTx) => {
    // 5a. Scalar fields + String[] arrays — ek hi updateMany mein
    if (hasScalars) {
      await tx.product.updateMany({
        where: { id: { in: idsToUpdate }, deleted: false },
        data: safeScalars,
      });
    }
 
    // 5b. Relational table updates (ProductLabel)
    if (hasLabels) {
      await this.bulkUpdateRelations(tx, idsToUpdate, labels);
    }
  });
 
  await this.cacheService.delByPattern('products:list:*');
 
  return {
    success: true,
    message: `${idsToUpdate.length} product(s) successfully update ho gaye`,
    matchedCount: idsToUpdate.length,
    modifiedCount: idsToUpdate.length,
  };
}


  /**
   * Duplicate Product Engine
   */
  async duplicateProduct(id: string) {
    const source = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        labels: true,
        packageContents: true,
        attributes: true,
        benefits: true,
        faqs: true,
      },
    });

    if (!source) throw new NotFoundException('Source product not found');

    const timestamp = Date.now().toString().slice(-4);
    const newSku = `${source.sku}-COPY-${timestamp}`;
    const newSlug = `${source.slug}-copy-${timestamp}`;

    const duplicated = await this.prisma.product.create({
      data: {
        name: `${source.name} (Copy)`,
        slug: newSlug,
        sku: newSku,
        description: source.description,
        price: source.price,
        originalPrice: source.originalPrice,
        categoryId: source.categoryId,
        stockQuantity: source.stockQuantity,
        status: ProductStatus.draft, // Duplicated items should default to Draft
        deliveryCharges: source.deliveryCharges,
        deliveryRule: source.deliveryRule,
        insuranceDetails: source.insuranceDetails,
        usageInstructions: source.usageInstructions,
        specifications: source.specifications ?? {},
        features: source.features ?? [],
        highlights: source.highlights ?? [],

        // Duplicate Nested Relations
        labels: {
          create: source.labels.map(({ id, productId, ...rest }) => rest),
        },
        packageContents: {
          create: source.packageContents.map(({ id, productId, ...rest }) => rest),
        },
        attributes: {
          create: source.attributes.map(({ id, productId, ...rest }) => rest),
        },
        benefits: {
          create: source.benefits.map(({ id, productId, ...rest }) => rest),
        },
        faqs: {
          create: source.faqs.map(({ id, productId, ...rest }) => rest),
        },

        images: {
          create: source.images.map(({ id, productId, ...rest }) => rest),
        },
      },
    });

    return {
      success: true,
      message: 'Product duplicated successfully',
      product: { ...duplicated, _id: duplicated.id },
    };
  }

  /**
   * Soft Delete Product (Status ko 'archived' par set karna)
   */
  
  async softDeleteProduct(id: string) {
  const existing = await this.prisma.product.findUnique({
    where: { id },
    select: { id: true, deleted: true, slug: true },
  });
 
  if (!existing) {
    throw new NotFoundException('Product nahi mila');
  }
 
  if (existing.deleted) {
    throw new BadRequestException('Product pehle se delete ho chuka hai');
  }
 
  const deleted = await this.prisma.product.update({
    where: { id },
    data: {
      deleted:   true,
      deletedAt: new Date(),
      status:    ProductStatus.archived,
    },
    select: { id: true, slug: true },
  });
 
  await this.clearProductCache(deleted.id, deleted.slug);
 
  return {
    success: true,
    message: 'Product soft-delete ho gaya — restore karke wapas la sakte ho',
    productId: deleted.id,
  };
}

  /**
   * Restore Soft-Deleted Product
   */
async restoreProduct(id: string) {
  const existing = await this.prisma.product.findUnique({
    where: { id },
    select: { id: true, deleted: true, slug: true },
  });
 
  if (!existing) {
    throw new NotFoundException('Product nahi mila');
  }
 
  if (!existing.deleted) {
    throw new BadRequestException('Yeh product delete nahi tha');
  }
 
  const restored = await this.prisma.product.update({
    where: { id },
    data: {
      deleted:   false,
      deletedAt: null,
      status:    ProductStatus.draft, // Admin manually activate karega
    },
    select: { id: true, slug: true, status: true },
  });
 
  await this.clearProductCache(restored.id, restored.slug);
 
  return {
    success: true,
    message: 'Product restore ho gaya — status "draft" hai, activate karo jab tayyar ho',
    product: restored,
  };
}


async hardDeleteProduct(id: string) {
  // ── Step 1: Product exist karta hai? ──────────────────────────────────────
  const product = await this.prisma.product.findUnique({
    where: { id },
    select: {
      id:      true,
      slug:    true,
      deleted: true,
      images:  {
        select: { id: true, imageId: true },
      },
    },
  });
 
  if (!product) {
    throw new NotFoundException('Product nahi mila');
  }
 
  // ── Step 2: Orders check karo ─────────────────────────────────────────────
  //    Agar koi bhi order hai toh hard delete allow nahi
  //    (Express mein bhi yahi logic tha)
  const orderCount = await this.prisma.orderItem.count({
    where: { productId: id },
  });
 
  if (orderCount > 0) {
    throw new BadRequestException(
      `Is product par ${orderCount} order(s) hain — permanently delete nahi ho sakta. ` +
        'Soft delete use karo.',
    );
  }
 
  // ── Step 3: Transaction mein images release + product delete ──────────────
  await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 3a. Har image ka usage ref release karo
    //     (ImageDedupService file delete + ImageAsset DB record cleanup karega)
    for (const img of product.images) {
      if (img.imageId) {
        await this.imageDedupService.releaseImageRef(
          img.imageId,
          UsageModel.product,
          id,
          'images',
          tx,
        );
      }
    }
 
    // 3b. ProductImage records delete karo
    //     (releaseImageRef ke baad — FK constraint release ho chuka hoga)
    await tx.productImage.deleteMany({ where: { productId: id } });
 
    // 3c. Baaki relational records cascade se delete honge (Prisma schema mein
    //     onDelete: Cascade set hai labels, packageContents, attributes,
    //     benefits, faqs par) — manually delete karne ki zaroorat nahi.
 
    // 3d. Product permanently delete karo
    await tx.product.delete({ where: { id } });
  });
 
  await this.clearProductCache(id, product.slug);
 
  return {
    success: true,
    message: 'Product aur uski images permanently delete ho gayi',
    productId: id,
  };
}



private async clearProductCache(id?: string, slug?: string) {
    if (id) await this.cacheService.del(`products:single:${id}`);
    if (slug) await this.cacheService.del(`products:single:${slug}`);
    await this.cacheService.delByPattern('products:list:*');
  }


}