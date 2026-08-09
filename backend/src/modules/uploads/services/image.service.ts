import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { ImageFolder, UsageModel, ImageAsset, Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as existsSync from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export interface ProcessedUpload {
  asset: ImageAsset;
  isNew: boolean;
}

@Injectable()
export class ImageDedupService {
  constructor(private readonly prisma: PrismaService) {}

  private sha256OfBuffer(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Process and Deduplicate image buffer (or Multer file buffer)
   */
  async processAndDedup(
    buffer: Buffer,
    folder: ImageFolder = ImageFolder.products,
    tx?: Prisma.TransactionClient,
  ): Promise<ProcessedUpload> {
    const db = tx || this.prisma;
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const sha256 = this.sha256OfBuffer(buffer);

    // 1. Exact Match Check
    const exactMatch = await db.imageAsset.findFirst({
      where: { sha256 },
    });

    if (exactMatch && existsSync.existsSync(path.join(process.cwd(), exactMatch.path))) {
      return { asset: exactMatch, isNew: false };
    }

    // 2. WebP Conversion & Disk Write
    const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const filePath = path.join(uploadDir, filename);
    const relativeUrl = `/uploads/${folder}/${filename}`;

    const webpBuffer = await sharp(buffer).webp({ quality: 82 }).toBuffer();
    await fs.writeFile(filePath, webpBuffer);

    // 3. Save Image Asset Record
    const asset = await db.imageAsset.create({
      data: {
        path: relativeUrl,
        folder,
        sha256,
        sizeBytes: webpBuffer.length,
      },
    });

    return { asset, isNew: true };
  }

  /**
   * Alias for backwards compatibility with products.service
   */
  async processAndDedupImage(
    file: Express.Multer.File,
    folder: ImageFolder = ImageFolder.products,
    tx?: Prisma.TransactionClient,
  ): Promise<ProcessedUpload> {
    return this.processAndDedup(file.buffer, folder, tx);
  }

  /**
   * Registers/Adds usage reference (Supports Transaction Client)
   */
  async addUsageRef(
    imageId: string,
    model: UsageModel,
    docId: string,
    field: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const db = tx || this.prisma;
    await db.imageAssetUsage.upsert({
      where: {
        imageId_model_docId_field: { imageId, model, docId, field },
      },
      create: { imageId, model, docId, field },
      update: {},
    });
  }

  /**
   * Alias for addUsageRef
   */
  async registerAssetUsage(
    imageId: string,
    model: UsageModel,
    docId: string,
    field: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    return this.addUsageRef(imageId, model, docId, field, tx);
  }

  /**
   * Releases usage reference and cleans up file if 0 references remain
   */
  async releaseImageRef(
    imageIdOrPath: string,
    model: UsageModel,
    docId: string,
    field: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const db = tx || this.prisma;

    const asset = await db.imageAsset.findFirst({
      where: {
        OR: [{ id: imageIdOrPath }, { path: imageIdOrPath }],
      },
    });

    if (!asset) return;

    await db.imageAssetUsage.deleteMany({
      where: { imageId: asset.id, model, docId, field },
    });

    const remainingRefs = await db.imageAssetUsage.count({
      where: { imageId: asset.id },
    });

    if (remainingRefs === 0) {
      const fullPath = path.join(process.cwd(), asset.path);
      await fs.unlink(fullPath).catch(() => null);
      await db.imageAsset.delete({ where: { id: asset.id } });
    }
  }
}