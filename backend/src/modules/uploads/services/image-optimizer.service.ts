/*eslint-disable*/
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import sharp from 'sharp';

@Injectable()
export class ImageOptimizerService {
  private readonly logger = new Logger(ImageOptimizerService.name);

  sha256OfBuffer(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async convertToWebp(buffer: Buffer, quality = 82): Promise<Buffer> {
    return sharp(buffer).webp({ quality }).toBuffer();
  }

  async computePHash(filePath: string): Promise<string | null> {
    try {
      const { imageHash } = await import('image-hash');
      return new Promise((resolve) => {
        imageHash(filePath, 16, true, (err: any, data: string) => {
          if (err) {
            this.logger.warn(`pHash computation failed: ${err.message}`);
            resolve(null);
          } else {
            resolve(data);
          }
        });
      });
    } catch (err) {
      this.logger.error('Failed to import or execute image-hash', err);
      return null;
    }
  }

  hammingDistance(a: string, b: string): number {
    if (!a || !b || a.length !== b.length) return Infinity;
    let dist = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = parseInt(a[i], 16) ^ parseInt(b[i], 16);
      dist += [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4][diff];
    }
    return dist;
  }
}