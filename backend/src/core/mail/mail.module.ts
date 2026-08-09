/*eslint-disable*/
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../queue/queue.module';
import { MailService } from './mail.service';
import { MailProcessor } from '../queue/processors/mail.processor';
import { UsersMailEventsListener } from './listeners/users-mail-events.listeners';

@Module({
  imports: [ConfigModule, QueueModule],
  providers: [
    MailService,
    MailProcessor,
    UsersMailEventsListener,
  ],
  exports: [MailService],
})
export class MailModule {}