/* eslint-disable */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/core/database/prisma.module';
import { BuyerAuthService } from '../auth/buyer-auth/auth.service';
import { BuyerAuthController } from '../auth/buyer-auth/auth.controller';
import { DeviceFingerprintService } from '../../common/utils/device-fingerprint.service';
import { AdminAuthService } from './admin-auth/admin-auth.service';
import { AdminAuthController } from './admin-auth/admin-auth.controller';
import { TwoFactorService } from './admin-auth/security/twoFa.security';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('BUYER_JWT_SECRET') ??
          config.get<string>('JWT_SECRET') ??
          'buyer_fallback_secret',
        signOptions: {
          expiresIn: (config.get<string>('BUYER_JWT_EXPIRES_IN') ?? '7d') as any, // 👈 Type cast with 'as any'
        },
      }),
    }),
  ],

  controllers: [BuyerAuthController,
    AdminAuthController
  ],

  providers: [
    BuyerAuthService,
    AdminAuthService,
    DeviceFingerprintService,
    TwoFactorService
  ],

  exports: [BuyerAuthService, 
    AdminAuthService
  ],
})
export class BuyerAuthModule {}