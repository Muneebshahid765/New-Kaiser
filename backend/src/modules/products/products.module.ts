/*eslint-disable*/
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CacheModule } from 'src/core/cache/redis/cache.module';
import { ImageDedupService } from '../uploads/services/image.service';
import { UploadsModule } from '../uploads/uploads.module';
import { PublicProductsController } from './public-product-data/public-products.controller';
import { PublicProductsService } from './public-product-data/public-products.service';

@Module({
  imports: [
   CacheModule,
   UploadsModule
  ],
  controllers: [ProductsController,PublicProductsController],
  providers: [
    ProductsService,
    PublicProductsService,
    ImageDedupService
  ],
  exports: [ProductsService,PublicProductsService],
})
export class ProductsModule {}