import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/core/database/prisma.service';
import { OrderStatus } from '@prisma/client';
// Import or inject standard Nodemailer Transporter Service

@Injectable()
export class ReviewReminderService {
  private readonly logger = new Logger(ReviewReminderService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleCronReminders() {
    this.logger.log('Starting automated review reminder checks...');
    await this.checkAndSendFirstReminders();
    await this.checkAndSendSecondReminders();
    this.logger.log('Completed automated review reminder checks.');
  }

  async checkAndSendFirstReminders(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    const orders = await this.prisma.order.findMany({
      where: {
        orderStatus: OrderStatus.delivered,
        deliveredAt: {
          gte: sevenDaysAgo,
          lt: sixDaysAgo,
        },
        reviewSubmitted: false,
        reviewReminderCount: 0,
      },
      include: {
        items: {
          take: 1,
          include: { product: true },
        },
      },
    });

    this.logger.log(`Found ${orders.length} orders eligible for FIRST review reminder.`);

    for (const order of orders) {
      const firstItem = order.items[0];
      if (!firstItem) continue;

      const product = firstItem.product || {
        id: firstItem.productId,
        name: firstItem.productName,
        price: firstItem.price,
      };

      const sent = await this.dispatchEmail(order, product, 1);
      if (sent) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            reviewReminderCount: 1,
            firstReminderSentAt: new Date(),
          },
        });
      }
    }
  }

  async checkAndSendSecondReminders(): Promise<void> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const thirteenDaysAgo = new Date();
    thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);

    const orders = await this.prisma.order.findMany({
      where: {
        orderStatus: OrderStatus.delivered,
        deliveredAt: {
          gte: fourteenDaysAgo,
          lt: thirteenDaysAgo,
        },
        reviewSubmitted: false,
        reviewReminderCount: 1,
        secondReminderSentAt: null,
      },
      include: {
        items: {
          take: 1,
          include: { product: true },
        },
      },
    });

    this.logger.log(`Found ${orders.length} orders eligible for SECOND review reminder.`);

    for (const order of orders) {
      const firstItem = order.items[0];
      if (!firstItem) continue;

      const product = firstItem.product || {
        id: firstItem.productId,
        name: firstItem.productName,
        price: firstItem.price,
      };

      const sent = await this.dispatchEmail(order, product, 2);
      if (sent) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            reviewReminderCount: 2,
            secondReminderSentAt: new Date(),
          },
        });
      }
    }
  }

  async sendImmediateReviewReminder(orderId: string): Promise<boolean> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { take: 1, include: { product: true } } },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.orderStatus !== OrderStatus.delivered) {
      throw new BadRequestException('Order must be delivered to send review reminder');
    }
    if (order.reviewSubmitted) {
      throw new BadRequestException('Review already submitted for this order');
    }

    const firstItem = order.items[0];
    if (!firstItem) throw new BadRequestException('No products found in order');

    const reminderNumber = order.reviewReminderCount + 1;
    if (reminderNumber > 2) {
      throw new BadRequestException('Maximum 2 reminders already sent for this order');
    }

    const product = firstItem.product || {
      id: firstItem.productId,
      name: firstItem.productName,
      price: firstItem.price,
    };

    const emailSent = await this.dispatchEmail(order, product, reminderNumber);
    if (emailSent) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          reviewReminderCount: reminderNumber,
          ...(reminderNumber === 1
            ? { firstReminderSentAt: new Date() }
            : { secondReminderSentAt: new Date() }),
        },
      });
    }

    return emailSent;
  }

  private async dispatchEmail(order: any, product: any, reminderNumber: number): Promise<boolean> {
    try {
      // Plug into Transporter or SES/Resend Provider
      this.logger.log(`Dispatching review email #${reminderNumber} to ${order.customerEmail}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${order.customerEmail}: ${err.message}`);
      return false;
    }
  }
}