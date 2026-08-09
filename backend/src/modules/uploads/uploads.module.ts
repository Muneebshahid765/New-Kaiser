import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { ImageDedupService } from './services/image.service';
import { ImageOptimizerService } from './services/image-optimizer.service';
import { OrphanCleanupService } from './services/orphan-cleanup.service';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    ImageDedupService,
    ImageOptimizerService,
    OrphanCleanupService,
  ],
  exports: [ImageDedupService, ImageOptimizerService],
})
export class UploadsModule {}