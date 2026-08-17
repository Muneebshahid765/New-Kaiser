import { Module } from '@nestjs/common';
import { ReviewController } from './reviews/admin-review.controller';
import { ReviewService } from './reviews/admin-review.service';
import { ReviewReminderService } from './reviews/review-reminder.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminSettingsController } from './settings/admin-settings.controller';
import { AdminSettingsService } from './settings/admin-settings.service';
import { AdminSettingsCronService } from './settings/admin-settings.cron';
import { ImageDedupService } from '../uploads/services/image.service';


@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [ReviewController, AdminSettingsController],
  providers: [ReviewService, ReviewReminderService,AdminSettingsService,AdminSettingsCronService,ImageDedupService],
  exports: [ReviewService,AdminSettingsService],
})
export class AdminModule {}