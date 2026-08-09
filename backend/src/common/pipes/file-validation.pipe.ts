import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
}

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  private readonly maxSizeInBytes: number;
  private readonly allowedMimeTypes: string[];

  constructor(options?: FileValidationOptions) {
    const maxSizeMB = options?.maxSizeMB ?? 5; // Default 5MB
    this.maxSizeInBytes = maxSizeMB * 1024 * 1024;
    this.allowedMimeTypes = options?.allowedMimeTypes ?? [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
  }

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    if (file.size > this.maxSizeInBytes) {
      const maxMb = (this.maxSizeInBytes / (1024 * 1024)).toFixed(0);
      throw new BadRequestException(`File size exceeds the maximum allowed limit of ${maxMb}MB.`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image format (${file.mimetype}). Allowed formats: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}