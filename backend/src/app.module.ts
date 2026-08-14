/*eslint-disable*/
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

// Database & Core Modules
import { PrismaModule } from './core/database/prisma.module';
import { QueueModule } from './core/queue/queue.module';
import { MailModule } from './core/mail/mail.module';

// Feature Modules
import { BuyerAuthModule } from './modules/auth/auth.module';

// Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Interceptors
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// Exception Filters
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { StripeExceptionFilter } from './common/filters/stripe-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import mailConfig from './core/config/mail.config';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { DeviceFingerprintService } from './common/utils/device-fingerprint.service';
import { ProfileModule } from './modules/users/users.module';
import { AdminSettingsModule } from './modules/admin-settings/admin-settings.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { FaqModule } from './modules/Public/public.module';
import { WebhookModule } from './modules/webhooks/webhook.module';
import { SubscriptionModule } from './modules/subscriptions/subscription.module';
import { StripeModule } from './core/stripe/stripe.module';
import { OrderModule } from './modules/orders/orders.module';
import { BuyerModule } from './modules/buyer/buyer.module';

@Module({
  imports: [
    // 1. Environment Config (Global)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailConfig],
    }),

    // 2. Event Emitter Setup (Email listeners wagerah ke liye)
    EventEmitterModule.forRoot(),

    // 3. Rate Limiting (100 requests per minute)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // 4. Core Infrastructure Modules
    PrismaModule,
    QueueModule, // Shared Redis & BullMQ Queues
    MailModule,
    
    // 5. Feature Modules
    BuyerAuthModule,
    ProfileModule,
    AdminSettingsModule,
    CategoriesModule,
    ProductsModule,
    FaqModule,
    WebhookModule,
    SubscriptionModule,
    StripeModule,
    OrderModule,
    BuyerModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    DeviceFingerprintService,

  {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, //  Entire app is private by default
    },  

    // ==========================================
    // GLOBAL INTERCEPTORS (Top-to-Bottom Execution)
    // ==========================================
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor, // 1. Unique Tracing ID
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // 2. Slow API Alert (>200ms)
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor, // 3. 15s Request Timeout
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizeInterceptor, // 4. Secrets & Passwords Stripper
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor, // 5. Standard `{ success: true, data }` Response
    },

    // ==========================================
    // GLOBAL EXCEPTION FILTERS (Specific-to-General Execution)
    // ==========================================
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter, // General Catch-All Fallback
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // HTTP & Validation Errors
    },
    {
      provide: APP_FILTER,
      useClass: StripeExceptionFilter, // Stripe Payment SDK Errors
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter, // Prisma Database Constraint Errors
    },
  ],
})
export class AppModule {}