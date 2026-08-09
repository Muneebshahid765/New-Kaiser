import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminSettingsCronService } from './admin-settings.cron';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService, AdminSettingsCronService],
  exports: [AdminSettingsService],
})
export class AdminSettingsModule {}