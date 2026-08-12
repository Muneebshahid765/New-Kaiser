import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ImageDedupService } from '../uploads/services/image.service';
import { CacheModule } from 'src/core/cache/redis/cache.module';

@Module({
    imports: [CacheModule],
  controllers: [WebhooksController],
  providers: [
    
    ImageDedupService,
     WebhooksService
   
  ],
  exports: [WebhooksService],
})
export class WebhookModule {}