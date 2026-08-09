/*eslint-disable*/
import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class DeviceFingerprintService {
  private readonly logger = new Logger(DeviceFingerprintService.name);

  generate(req: Request, clientFingerprint = ''): string {
    try {
      const userAgent = req.headers['user-agent'] ?? 'unknown';
      const acceptLanguage = req.headers['accept-language'] ?? 'unknown';
      const acceptEncoding = req.headers['accept-encoding'] ?? 'unknown';
      
      const forwardedFor = req.headers['x-forwarded-for'] as string | undefined;
      const clientIp = req.ip ?? forwardedFor?.split(',')[0]?.trim() ?? req.socket?.remoteAddress ?? 'unknown';

      const raw = [userAgent, acceptLanguage, acceptEncoding, clientIp, clientFingerprint].join('|');
      return createHash('sha256').update(raw).digest('hex');
    } catch (error) {
      this.logger.error('Failed to generate device fingerprint', error as Error);
      return randomBytes(32).toString('hex');
    }
  }

  verify(req: Request, storedFingerprint: string, clientFingerprint = ''): boolean {
    try {
      if (!storedFingerprint) return false;
      const generated = this.generate(req, clientFingerprint);
      return generated === storedFingerprint;
    } catch (error) {
      this.logger.error('Failed to verify device fingerprint', error as Error);
      return false;
    }
  }
}