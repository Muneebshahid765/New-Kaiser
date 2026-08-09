import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ImageDedupService } from './services/image.service';
import { ImageFolder } from '@prisma/client';

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageDedupService,
  ) {}

  async uploadSingleFile(file: Express.Multer.File, folder: ImageFolder = ImageFolder.products) {
    // 👇 FIX: processAndDedup() returns { asset, isNew } — destructure it so
    // `data` below is the flat ImageAsset itself, not { asset, isNew } nested
    // one level too deep. (Previously: `const asset = await ...` shadowed the
    // real entity with the whole wrapper object.)
    const { asset } = await this.imageService.processAndDedup(file.buffer, folder);
    return {
      success: true,
      data: asset,
    };
  }

  async getAssetMetadata(id: string) {
    const asset = await this.prisma.imageAsset.findUnique({
      where: { id },
      include: { usages: true },
    });
    if (!asset) throw new NotFoundException('Image Asset not found');
    return { success: true, data: asset };
  }
}