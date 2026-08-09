import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { UploadsModule } from '../uploads/uploads.module';
import { CacheModule } from 'src/core/cache/redis/cache.module';

@Module({
  imports: [UploadsModule, CacheModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}