/*eslint-disable*/
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/core/database/prisma.service';
import { BuyerRegisterDto } from '../dto/register.dto';
import type { Request } from 'express';
import {
  ForgotPasswordDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/auth.dto';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { randomInt, createHash, timingSafeEqual } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Events
import { UserRegisteredEvent } from 'src/core/events/auth/user-registered.events';
import { ForgotPasswordResetRequestedEvent } from 'src/core/events/auth/forgot-password.event';
import { UserRole } from '@prisma/client';
import { LoginDtoType } from '../dto/login.dto';
import { generateAuthToken } from 'src/common/utils/auth-token.util';
import { DeviceFingerprintService } from 'src/common/utils/device-fingerprint.service';
import { JwtService } from '@nestjs/jwt';

const DUMMY_HASH = '$2b$10$e8pA2v/H60Y3QOqZJzZ33O5J5.H5/6b.J3e1234567890abcdefg'

@Injectable()
export class BuyerAuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME_MS = 15 * 60 * 1000; // 15 Minutes
  private readonly MAX_RESEND_COUNT = 3;
  private readonly RESEND_WINDOW_MS = 15 * 60 * 1000; // 15 Minutes
  private readonly FORGOT_PASSWORD_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 Hours
  private readonly MAX_FORGOT_PASSWORD_COUNT = 2; // Max 2 daily

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly deviceFingerprint: DeviceFingerprintService,
  ) {}

  // ==========================================
  // UTILITY METHODS (Crypto & Security)
  // ==========================================
  private hashVerificationCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  private safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  // ==========================================
  // 1. REGISTRATION & EMAIL VERIFICATION
  // ==========================================
  async registration(dto: BuyerRegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const rounds = this.config.get<number>('app.bcryptRounds') ?? 10;
    const hashedPassword = await bcrypt.hash(dto.password, rounds);

    const rawVerificationCode = randomInt(100000, 999999).toString();
    const hashedVerificationCode = this.hashVerificationCode(rawVerificationCode);
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Mins Expiry

    // Transaction to create both User and BuyerProfile
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.buyer,
          buyerProfile: {
            create: {
              firstName: dto.firstName.trim(),
              lastName: dto.lastName.trim(),
              verificationCode: hashedVerificationCode,
              verificationExpires,
              resendCount: 1,
              resendWindowStart: new Date(),
            },
          },
        },
        include: {
          buyerProfile: true,
        },
      });

      return user;
    });

    // Event Triggering for Email Queue Worker
    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(
        result.email,
        result.buyerProfile?.firstName ?? '',
        rawVerificationCode,
      ),
    );

    return {
      message: 'Registration successful. Please verify your email.',
      buyer: {
        id: result.buyerProfile?.id,
        userId: result.id,
        firstName: result.buyerProfile?.firstName,
        lastName: result.buyerProfile?.lastName,
        email: result.email,
      },
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { buyerProfile: true },
    });

    if (!user || !user.buyerProfile) {
      throw new NotFoundException('No account found with this email.');
    }

    const profile = user.buyerProfile;

    if (profile.isVerified) {
      throw new ConflictException('This email is already verified.');
    }

    if (!profile.verificationCode || !profile.verificationExpires) {
      throw new BadRequestException('No verification code found. Please request a new one.');
    }

    if (profile.verificationExpires < new Date()) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    const hashedInput = this.hashVerificationCode(dto.code);
    const isMatch = this.safeCompare(hashedInput, profile.verificationCode);

    if (!isMatch) {
      throw new BadRequestException('Invalid verification code.');
    }

    const updatedProfile = await this.prisma.buyerProfile.update({
      where: { id: profile.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
        resendCount: 0,
        resendWindowStart: null,
      },
      select: { id: true, firstName: true, lastName: true },
    });

    return {
      message: 'Email verified successfully. Your account is now active.',
      buyer: {
        ...updatedProfile,
        email: user.email,
      },
    };
  }

  async resendVerificationCode(dto: ResendVerificationDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { buyerProfile: true },
    });

    if (!user || !user.buyerProfile) {
      throw new NotFoundException('Buyer account not found.');
    }

    const profile = user.buyerProfile;

    if (profile.isVerified) {
      throw new BadRequestException('Account is already verified.');
    }

    const now = new Date();
    let count = profile.resendCount;
    let windowStart = profile.resendWindowStart;

    if (!windowStart || now.getTime() - windowStart.getTime() > this.RESEND_WINDOW_MS) {
      windowStart = now;
      count = 0;
    }

    if (count >= this.MAX_RESEND_COUNT) {
      throw new BadRequestException(
        'Too many verification code requests. Please try again after 15 minutes.',
      );
    }

    const rawOtpCode = randomInt(100000, 999999).toString();
    const hashedOtpCode = this.hashVerificationCode(rawOtpCode);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.buyerProfile.update({
      where: { id: profile.id },
      data: {
        verificationCode: hashedOtpCode,
        verificationExpires: otpExpires,
        resendCount: count + 1,
        resendWindowStart: windowStart,
      },
    });

    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(user.email, profile.firstName, rawOtpCode),
    );

    return { message: 'Verification code sent successfully.' };
  }

  // ==========================================
  // 2. FORGOT PASSWORD & RESET PASSWORD
  // ==========================================
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { buyerProfile: true },
    });

    const successMessage = {
      message: 'If that email is registered, a password reset link has been sent.',
    };

    if (!user || !user.buyerProfile || !user.buyerProfile.isVerified || !user.isActive) {
      return successMessage;
    }

    const profile = user.buyerProfile;
    const now = new Date();
    let count = profile.forgotPasswordCount || 0;
    let windowStart = profile.forgotPasswordWindowStart;

    if (!windowStart || now.getTime() - windowStart.getTime() > this.FORGOT_PASSWORD_WINDOW_MS) {
      windowStart = now;
      count = 0;
    }

    if (count >= this.MAX_FORGOT_PASSWORD_COUNT) {
      throw new BadRequestException(
        'Too many password reset requests. Maximum 2 allowed per 24 hours.',
      );
    }

    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = this.hashVerificationCode(rawResetToken);
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour Expiry

    await this.prisma.buyerProfile.update({
      where: { id: profile.id },
      data: {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: tokenExpires,
        forgotPasswordCount: count + 1,
        forgotPasswordWindowStart: windowStart,
      },
    });

    this.eventEmitter.emit(
      'auth.password-reset-requested',
      new ForgotPasswordResetRequestedEvent(
        profile.id,
        profile.firstName,
        user.email,
        rawResetToken,
      ),
    );

    return successMessage;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = this.hashVerificationCode(dto.token);

    const profile = await this.prisma.buyerProfile.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!profile || !profile.user) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const rounds = this.config.get<number>('app.bcryptRounds') ?? 10;
    const newHashedPassword = await bcrypt.hash(dto.newPassword, rounds);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: profile.userId },
        data: {
          password: newHashedPassword,
          loginAttempts: 0,
          lockUntil: null,
          lastPasswordChange: new Date(),
        },
      }),
      this.prisma.buyerProfile.update({
        where: { id: profile.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      }),
    ]);

    return { message: 'Password has been reset successfully. You can now login.' };
  }

  async verifyPasswordResetLink(token: string) {
    const hashedToken = this.hashVerificationCode(token);

    const profile = await this.prisma.buyerProfile.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!profile) {
      return { valid: false, message: 'Reset link is invalid or has expired.' };
    }

    return { valid: true, message: 'Reset link is valid.' };
  }

  // ==========================================
  // 3. LOGIN & LOCKOUT HANDLING
  // ==========================================
async login(dto: LoginDtoType, req: Request) {
    const email = dto.email.trim().toLowerCase();

    // 1. Fetch Buyer User
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { buyerProfile: true },
    });

    // Timing-attack mitigation: Same duration dummy hash compare if user not found
    if (!user || !user.buyerProfile || user.role !== UserRole.buyer) {
      await bcrypt.compare(dto.password, DUMMY_HASH);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // 2. Email Verification Check
    if (!user.buyerProfile.isVerified) {
      throw new ForbiddenException('Please verify your email address before logging in.');
    }

    // 3. Account Active Status Check
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Contact support.');
    }

    // 4. Lockout Duration Check
    const now = new Date();
    if (user.lockUntil && user.lockUntil > now) {
      const remainingMins = Math.ceil((user.lockUntil.getTime() - now.getTime()) / 60000);
      throw new UnauthorizedException(
        `Account is temporarily locked due to multiple failed attempts. Try again in ${remainingMins} minutes.`,
      );
    }

    // 5. Password Comparison
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      const attempts = user.loginAttempts + 1;
      let lockUntil: Date | null = null;

      if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
        lockUntil = new Date(now.getTime() + this.LOCK_TIME_MS);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockUntil,
        },
      });

      if (lockUntil) {
        throw new UnauthorizedException(
          'Account locked for 15 minutes due to multiple failed login attempts.',
        );
      }

      throw new UnauthorizedException('Invalid email or password.');
    }

    // 6. Reset Lockout & Track Last Login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date(),
      },
    });

    // 7. Device Fingerprint Generation
    const clientHeaderFp = (req.headers['x-device-fingerprint'] as string) ?? '';
    const fp = this.deviceFingerprint.generate(req, clientHeaderFp);

    // 8. Sign Token
    const token = generateAuthToken(
      this.jwtService,
      this.config,
      { sub: user.id, email: user.email, role: user.role, fp },
      {
        secretKey: 'BUYER_JWT_SECRET',
        expireKey: 'BUYER_JWT_EXPIRES_IN',
        defaultExpire: '7d',
      },
    );

    return {
      token,
      buyer: {
        id: user.buyerProfile.id,
        userId: user.id,
        firstName: user.buyerProfile.firstName,
        lastName: user.buyerProfile.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }
}