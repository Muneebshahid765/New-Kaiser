/* eslint-disable */
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from 'src/core/database/prisma.service';
import { DeviceFingerprintService } from '../utils/device-fingerprint.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

// ─── Smart Cookie Extractor ───────────────────────────────────────────────
function smartCookieExtractor(req: Request): string | null {
  if (!req?.cookies) return null;

  // URL Path ke mutabiq cookie select karein taake cookie collision na ho
  const isBuyerRoute = req.originalUrl?.includes('/api/buyer');
  
  if (isBuyerRoute) {
    return req.cookies['buyer_token'] ?? null;
  }
  
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
      jwtFromRequest: smartCookieExtractor,
      ignoreExpiration: false,
      passReqToCallback: true,
      
      // 👈 FIX: Dynamic Secret Resolver so Passport doesn't fail signature check before validate()
      secretOrKeyProvider: (request: Request, _rawJwtToken: any, done: any) => {
        const isBuyerRoute = request.originalUrl?.includes('/api/buyer');
        const hasBuyerTokenOnly = request.cookies?.['buyer_token'] && !request.cookies?.['admin_token'];
        
        const secret = (isBuyerRoute || hasBuyerTokenOnly)
          ? config.get<string>('BUYER_JWT_SECRET')
          : config.get<string>('JWT_SECRET');

        done(null, secret);
      },
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    if (!payload) throw new UnauthorizedException('Invalid or expired token.');

    // ── 1. Device Fingerprint Check ───────────────────────────────────────
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

    // ── 2. DB Lookup ──────────────────────────────────────────────────────
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

    // ── 3. Role-specific validation ───────────────────────────────────────
    if (user.role !== payload.role) {
      throw new UnauthorizedException('Token role does not match account role.');
    }

    if (user.role === UserRole.buyer) {
      if (!user.buyerProfile) throw new UnauthorizedException('Buyer profile missing.');
      
      // ⚠️ Note: Make sure isVerified is true in your DB for buyer user
      if (!user.buyerProfile.isVerified) {
        throw new ForbiddenException('Buyer account is not verified.');
      }
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
}