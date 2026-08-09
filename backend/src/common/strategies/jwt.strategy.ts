/* eslint-disable */
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from 'src/core/database/prisma.service';
import { DeviceFingerprintService } from '../utils/device-fingerprint.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';

// ─── Cookie extractor that picks the right cookie per role ────────────────
function roleAwareCookieExtractor(req: Request): string | null {
  if (!req?.cookies) return null;
  // Admin token takes priority if present
  return req.cookies['admin_token'] ?? req.cookies['buyer_token'] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly deviceFingerprint: DeviceFingerprintService,
  ) {
    super({
      // We extract manually; secret resolved in validate() per role
      jwtFromRequest: roleAwareCookieExtractor,
      ignoreExpiration: false,
      // Fallback secret — actual verification happens per-role below
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'fallback_jwt_secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    // ── 1. Role-based secret re-verification ──────────────────────────────
    // passport-jwt already verified with JWT_SECRET above, but buyer tokens
    // are signed with BUYER_JWT_SECRET — we must re-verify with correct secret.
    const rawToken =
      req.cookies?.['admin_token'] ?? req.cookies?.['buyer_token'] ?? null;

    if (!rawToken) throw new UnauthorizedException('No token found.');

    const isAdminToken = !!req.cookies?.['admin_token'];
    const expectedRole = isAdminToken ? UserRole.admin : UserRole.buyer;

    // Token role must match cookie name
    if (payload.role !== expectedRole) {
      throw new UnauthorizedException('Token role mismatch. Access denied.');
    }

    // Re-verify signature with the correct secret
    const correctSecret = isAdminToken
      ? this.config.get<string>('JWT_SECRET')
      : this.config.get<string>('BUYER_JWT_SECRET');

    if (!correctSecret) {
      throw new UnauthorizedException('Server misconfiguration.');
    }

    if (!this.verifyJwtSignature(rawToken, correctSecret)) {
      throw new UnauthorizedException('Invalid token signature.');
    }

    // ── 2. Device Fingerprint Check ───────────────────────────────────────
    const clientFingerprint =
      (req.headers['x-device-fingerprint'] as string) ?? '';

    if (
      !payload.fp ||
      !this.deviceFingerprint.verify(req, payload.fp, clientFingerprint)
    ) {
      throw new UnauthorizedException(
        'Session mismatched or device altered. Please login again.',
      );
    }

    // ── 3. DB Lookup ──────────────────────────────────────────────────────
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lockUntil: true,
        adminProfile: {
          select: {
            id: true,
            name: true,
            settings: { select: { profilePicture: true } },
          },
        },
        buyerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Account not found.');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated or suspended.');
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked.');
    }

    // ── 4. Role-specific validation ───────────────────────────────────────
    // DB role must also match — token role alone is not enough
    if (user.role !== expectedRole) {
      throw new UnauthorizedException('Token role does not match account role.');
    }

    if (user.role === UserRole.buyer) {
      if (!user.buyerProfile) throw new UnauthorizedException('Buyer profile missing.');
      if (!user.buyerProfile.isVerified) throw new ForbiddenException('Buyer account is not verified.');
    }

    if (user.role === UserRole.admin) {
      if (!user.adminProfile) throw new UnauthorizedException('Admin profile missing.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      adminProfile: user.adminProfile,
      buyerProfile: user.buyerProfile,
    };
  }

  // ─── Manual HMAC-SHA256 signature check ──────────────────────────────────
  // jose/jsonwebtoken se alag — sirf signature part verify karta hai
  private verifyJwtSignature(token: string, secret: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const [header, payload, signature] = parts;
      const expected = createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64url');

      return timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected),
      );
    } catch {
      return false;
    }
  }
}