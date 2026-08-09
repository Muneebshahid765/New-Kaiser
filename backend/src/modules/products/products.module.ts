/*eslint-disable*/
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CacheModule } from 'src/core/cache/redis/cache.module';
import { ImageDedupService } from '../uploads/services/image.service';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
   CacheModule,
   UploadsModule
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ImageDedupService
  ],
  exports: [ProductsService],
})
export class ProductsModule {}