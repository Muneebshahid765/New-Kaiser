import { Module } from '@nestjs/common';
import { FaqsController } from './faq/faq.controller';
import { FaqsService } from './faq/faq.service';
import { CacheModule } from 'src/core/cache/redis/cache.module'; // Adjust path according to project structure
import { MessagesController } from './contact/contact.controller';
import { MessagesService } from './contact/contact.service';

@Module({
  imports: [CacheModule],
  controllers: [FaqsController,MessagesController],
  providers: [FaqsService,MessagesService],
  exports: [FaqsService,MessagesService],
})
export class FaqModule {}