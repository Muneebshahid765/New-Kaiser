/*eslint-disable*/
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq';
import { MAIL_QUEUE } from '../../queue/queue.constants';
import { UserRegisteredEvent } from 'src/core/events/auth/user-registered.events';
import { ForgotPasswordResetRequestedEvent } from 'src/core/events/auth/forgot-password.event';

/**
 * ✅ INDUSTRY-STANDARD PATTERN: "Mail Event Dispatcher"
 *
 * Yeh class ka poora kaam ek hi cheez hai: domain events sunna aur unhe
 * mail-queue jobs mein translate karna. Chahe kitne bhi mail-trigger
 * events ho jayen (order.created, password.reset.requested, waghera),
 * sab yahin ek jagah dikhte hain — kisi ko poora system samajhne ke
 * liye 10 alag files kholni nahi padtin, sirf yeh ek file.
 *
 * Jab bhi naya email-triggering event add karna ho:
 * 1. Event class `src/core/events/` mein banayen (agar nayi hai)
 * 2. Yahan ek naya @OnEvent() method add karein
 * 3. Bas — koi nayi Logger/Queue boilerplate nahi likhni
 *
 * NOTE: Agar kisi listener ka logic complex ho jaye (jaise DB se extra
 * data fetch karna, conditional branching, external API calls), tab
 * usay yahan se nikal kar apni alag file mein banayen — yeh consolidation
 * sirf "simple, identical-shape" listeners ke liye hai.
 */
@Injectable()
export class UsersMailEventsListener {
  private readonly logger = new Logger(UsersMailEventsListener.name);

  constructor(@InjectQueue(MAIL_QUEUE)
   private readonly mailQueue: Queue,
   private readonly config: ConfigService,) {}

  @OnEvent('user.registered')
  async onUserRegistered(event: UserRegisteredEvent) {
    this.logger.log(`Queuing verification email for: ${event.email}`);

    await this.mailQueue.add('send_verification_email', {
      to: event.email,
      subject: 'Verify Your Email — AfricaKaiser',
      template: 'verification',
      context: {
        firstName: event.firstName,
        verificationCode: event.verificationCode,
      },
    });
  }

@OnEvent('auth.password-reset-requested')
 async handlePasswordResetRequested(event: ForgotPasswordResetRequestedEvent) {
  // 1. Correct Log Message
  this.logger.log(`Queuing password reset email for: ${event.email}`);

  const frontendBase = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173';

  // 2. Trailing slash handle karke URL construct karna (Perfect 👍)
  const resetUrl = `${frontendBase.replace(/\/$/, '')}/reset-password?token=${event.resetToken}`;

  // 3. Queue Handoff with Robust Options
  await this.mailQueue.add(
    'send_password_reset_email',
    {
      to: event.email,
      subject: 'Reset Password — AfricaKaiser',
      template: 'password-reset',
      context: {
        firstName: event.firstName,
        resetUrl,
        brandName: 'AfricaKaiser',
      },
    },
    {
      attempts: 3, // Network error par 3 baar try kare
      backoff: {
        type: 'exponential',
        delay: 2000, // 2s, 4s, 8s ka retry delay
      },
      removeOnComplete: true, // Memory usage clean rakhne ke liye
      removeOnFail: { count: 100 }, // Failed jobs ka log retain kare debugging ke liye
    },
  );
}

  // 👇 Future additions — bas yahan add karte jayen, koi nayi file nahi:
  //
  // @OnEvent('order.created')
  // async onOrderCreated(event: OrderCreatedEvent) {
  //   await this.mailQueue.add('send_order_receipt', {
  //     to: event.customerEmail,
  //     subject: `Your order #${event.orderNumber} is confirmed`,
  //     template: 'order-receipt',
  //     context: { ...event },
  //   });
  // }
  //
  // @OnEvent('password.reset.requested')
  // async onPasswordResetRequested(event: PasswordResetRequestedEvent) {
  //   await this.mailQueue.add('send_password_reset', {
  //     to: event.email,
  //     subject: 'Reset Your Password',
  //     template: 'password-reset',
  //     context: { firstName: event.firstName, resetUrl: event.resetUrl },
  //   });
  // }
}