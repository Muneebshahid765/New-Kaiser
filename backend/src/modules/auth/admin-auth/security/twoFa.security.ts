/*eslint-disable*/
import { Injectable, BadRequestException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TwoFactorService {
  // 1. Generate Secret & QR Code for Setup
  async generateSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `ModernKaiser Admin (${email})`,
      length: 20,
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url ?? '');

    return {
      secret: secret.base32, // Save this in DB temporarily or permanently
      qrCodeUrl,             // Return this to display in frontend
    };
  }

  // 2. Verify Time-based OTP Token
  verifyToken(token: string, secret: string): boolean {
    if (!token || !secret) return false;

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: token.trim(),
      window: 1, // Clock drift allowance (+/- 30 secs)
    });
  }
}