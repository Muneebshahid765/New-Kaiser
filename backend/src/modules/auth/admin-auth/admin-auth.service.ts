/*eslint-disable*/
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';
import { generateAuthToken } from 'src/common/utils/auth-token.util';
import { DeviceFingerprintService } from '../../../common/utils/device-fingerprint.service';
import { TwoFactorService } from './security/twoFa.security';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import {
  VerifyTwoFactorLoginDto,
  VerifyTwoFactorSetupDto,
  DisableTwoFactorDto,
} from '../dto/two-factor.dto';
import { LoginDtoType } from '../dto/login.dto';
import { AdminLoginResponse } from './security/login.interface';

const DUMMY_HASH = '$2b$10$e8pA2v/H60Y3QOqZJzZ33O5J5.H5/6b.J3e1234567890abcdefg';

@Injectable()
export class AdminAuthService {

  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME_MS = 30 * 60 * 1000; // 30 Minutes
  private readonly TEMP_SESSION_EXPIRY_MS = 5 * 60 * 1000; // 5 Minutes for 2FA OTP input

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly deviceFingerprint: DeviceFingerprintService,
    private readonly twoFactorService: TwoFactorService,
  ) {}


  /*eslint-disable*/
async login(dto: LoginDtoType, req: Request) : Promise<AdminLoginResponse> {
  const email = dto.email.trim().toLowerCase();

  const user = await this.prisma.user.findUnique({
    where: { email },
    include: { adminProfile: true },
  });

  // Dummy compare to mitigate Timing-Based User Enumeration Attacks
  if (!user || !user.adminProfile || user.role !== UserRole.admin) {
    await bcrypt.compare(dto.password, DUMMY_HASH);
    throw new UnauthorizedException('Invalid credentials.');
  }

  if (!user.isActive) {
    throw new UnauthorizedException('Your account is deactivated. Contact support.');
  }

  const now = new Date();
  if (user.lockUntil && user.lockUntil > now) {
    const remainingMins = Math.ceil((user.lockUntil.getTime() - now.getTime()) / 60000);
    throw new UnauthorizedException(
      `Account locked due to security attempts. Try again in ${remainingMins} minutes.`,
    );
  }

  const isPasswordValid = await bcrypt.compare(dto.password, user.password);

  if (!isPasswordValid) {
    const attempts = user.loginAttempts + 1;
    let lockUntil: Date | null = null;

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      lockUntil = new Date(now.getTime() + this.LOCK_TIME_MS);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: attempts, lockUntil },
    });

    if (lockUntil) {
      throw new UnauthorizedException('Account locked due to multiple failed login attempts.');
    }

    throw new UnauthorizedException('Invalid credentials.');
  }

  // Password correct -> Reset login attempts
  await this.prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockUntil: null, lastLogin: now },
  });

  // =========================================================================
  // 🌟 NEW 2FA CHECK LOGIC (Added right before token generation)
  // =========================================================================
  // admin-auth.service.ts

if (user.adminProfile.twoFactorEnabled) {
  const tempSessionId = crypto.randomUUID();
  const tempExpiry = new Date(now.getTime() + 5 * 60 * 1000);

  await this.prisma.adminProfile.update({
    where: { id: user.adminProfile.id },
    data: {
      pendingTwoFactorSession: tempSessionId,
      pendingTwoFactorExpiry: tempExpiry,
    },
  });

  // Direct return karain (ResponseInterceptor outer wrapper handle kar lega)
  return {
    requiresTwoFactor: true,
    message: '2FA verification required',
    email: user.email,
    tempSessionId,
  } as any;
}

  // =========================================================================
  // If 2FA is NOT enabled, issue JWT Token directly
  // =========================================================================
  return this.issueAdminToken(user, req);
}


  // 1. SETUP 2FA (Generates Secret & QR Code)
  async setupTwoFactor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) {
      throw new NotFoundException('Admin not found');
    }

    if (user.adminProfile.twoFactorEnabled) {
      throw new BadRequestException(
        '2FA is already enabled. Please disable it first to set up again.',
      );
    }

    const { secret, qrCodeUrl } = await this.twoFactorService.generateSecret(user.email);

    // Save secret to database (don't enable 2FA yet)
    await this.prisma.adminProfile.update({
      where: { id: user.adminProfile.id },
      data: { twoFactorSecret: secret },
    });

    return {
      message: '2FA setup initiated. Please scan the QR code and verify.',
      data: {
        secret,
        qrCode: qrCodeUrl,
        manualEntryKey: secret,
      },
    };
  }

  // 2. VERIFY SETUP & ENABLE 2FA
  async verifyAndEnableTwoFactor(userId: string, dto: VerifyTwoFactorSetupDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) {
      throw new NotFoundException('Admin not found');
    }

    if (!user.adminProfile.twoFactorSecret) {
      throw new BadRequestException('Please setup 2FA first');
    }

    const verified = this.twoFactorService.verifyToken(
      dto.token,
      user.adminProfile.twoFactorSecret,
    );

    if (!verified) {
      throw new BadRequestException('Invalid verification code. Please try again.');
    }

    // Enable 2FA
    await this.prisma.adminProfile.update({
      where: { id: user.adminProfile.id },
      data: {
        twoFactorEnabled: true,
        lastAction: '2FA Enabled',
        lastActionAt: new Date(),
      },
    });

    return {
      message: '2FA has been successfully enabled!',
      data: { twoFactorEnabled: true },
    };
  }

  // 3. VERIFY 2FA DURING LOGIN (Public Endpoint)
  async verifyLoginTwoFactor(dto: VerifyTwoFactorLoginDto, req: Request) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile || user.role !== UserRole.admin) {
      throw new NotFoundException('Admin not found');
    }

    if (!user.adminProfile.twoFactorEnabled || !user.adminProfile.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled for this account');
    }

    // Verify session ID matches
    if (
      !user.adminProfile.pendingTwoFactorSession ||
      user.adminProfile.pendingTwoFactorSession !== dto.tempSessionId
    ) {
      throw new UnauthorizedException('Invalid or expired session. Please login again.');
    }

    // Verify Session Expiry (5 Mins)
    if (
      !user.adminProfile.pendingTwoFactorExpiry ||
      user.adminProfile.pendingTwoFactorExpiry < new Date()
    ) {
      // Clear expired session
      await this.prisma.adminProfile.update({
        where: { id: user.adminProfile.id },
        data: { pendingTwoFactorSession: null, pendingTwoFactorExpiry: null },
      });

      throw new UnauthorizedException('Session expired. Please login again.');
    }

    // Verify 2FA OTP Code
    const verified = this.twoFactorService.verifyToken(
      dto.token,
      user.adminProfile.twoFactorSecret,
    );

    if (!verified) {
      throw new BadRequestException('Invalid verification code. Please try again.');
    }

    // Clear pending session & Update login status
    await this.prisma.adminProfile.update({
      where: { id: user.adminProfile.id },
      data: {
        pendingTwoFactorSession: null,
        pendingTwoFactorExpiry: null,
        lastAction: '2FA Login Verified',
        lastActionAt: new Date(),
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null, lastLogin: new Date() },
    });

    // Issue Real JWT Token
    return this.issueAdminToken(user, req);
  }

  // 4. DISABLE 2FA (Requires Password + 2FA Code)
  async disableTwoFactor(userId: string, dto: DisableTwoFactorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) {
      throw new NotFoundException('Admin not found');
    }

    // Verify Password
    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (!user.adminProfile.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify 2FA Code before disabling
    const verified = this.twoFactorService.verifyToken(
      dto.token,
      user.adminProfile.twoFactorSecret ?? '',
    );

    if (!verified) {
      throw new BadRequestException('Invalid verification code');
    }

    // Disable 2FA & Wipe Secret
    await this.prisma.adminProfile.update({
      where: { id: user.adminProfile.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        pendingTwoFactorSession: null,
        pendingTwoFactorExpiry: null,
        lastAction: '2FA Disabled',
        lastActionAt: new Date(),
      },
    });

    return {
      message: '2FA has been successfully disabled',
      data: { twoFactorEnabled: false },
    };
  }

  // 5. GET 2FA STATUS
  async getTwoFactorStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) {
      throw new NotFoundException('Admin not found');
    }

    return {
      data: {
        twoFactorEnabled: user.adminProfile.twoFactorEnabled ?? false,
      },
    };
  }

  // Helper function to issue JWT Token
  private issueAdminToken(user: any, req: Request) {
    const clientHeaderFp = (req.headers['x-device-fingerprint'] as string) ?? '';
    const fp = this.deviceFingerprint.generate(req, clientHeaderFp);

    const token = generateAuthToken(
      this.jwtService,
      this.config,
      { sub: user.id, email: user.email, role: user.role, fp },
      {
        secretKey: 'JWT_SECRET',
        expireKey: 'ADMIN_JWT_EXPIRES_IN',
        defaultExpire: '1d',
      },
    );

    return {
      message: '2FA verification successful. Login complete!',
      token,
      data: {
        id: user.adminProfile.id,
        userId: user.id,
        name: user.adminProfile.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        twoFactorEnabled: user.adminProfile.twoFactorEnabled,
      },
    };
  }
}