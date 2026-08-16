/*eslint-disable*/
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AdminSettingsCronService {
  private readonly logger = new Logger(AdminSettingsCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Automated Discount Expiry Task - Runs Every Hour Top of the Hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredDiscounts() {
    this.logger.log('Running automated discount expiry check...');

    const now = new Date();

    try {
      // Find and disable discounts that are active but passed discountEndDate
      const result = await this.prisma.adminSettings.updateMany({
        where: {
          discountEnabled: true,
          discountEndDate: {
            not: null,
            lt: now, // Less than current date/time
          },
        },
        data: {
          discountEnabled: false,
        },
      });

      if (result.count > 0) {
        this.logger.log(`Successfully auto-disabled ${result.count} expired site-wide discount(s).`);
      } else {
        this.logger.log('No expired discounts found.');
      }
    } catch (error) {
      this.logger.error('Failed to run automated discount expiry cron job', error);
    }
  }
}