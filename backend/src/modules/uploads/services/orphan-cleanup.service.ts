import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../core/database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OrphanCleanupService {
  private readonly logger = new Logger(OrphanCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOrphanImages() {
    this.logger.log('Starting orphan images cleanup scan...');

    const orphanAssets = await this.prisma.imageAsset.findMany({
      where: { usages: { none: {} } },
    });

    let cleanedCount = 0;
    for (const asset of orphanAssets) {
      const fullPath = path.join(process.cwd(), asset.path);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          this.logger.error(`Failed to delete physical file: ${fullPath}`, err);
        }
      }
      await this.prisma.imageAsset.delete({ where: { id: asset.id } });
      cleanedCount++;
    }

    this.logger.log(`Orphan cleanup finished. Removed ${cleanedCount} orphaned images.`);
  }
}