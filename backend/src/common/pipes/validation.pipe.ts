/* eslint-disable */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export interface ValidationErrorItem {
  field: string;
  message: string;
  received?: string;
}

@Injectable()
export class ZodValidationPipe<TSchema extends ZodSchema = ZodSchema>
  implements PipeTransform
{
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(private readonly schema: TSchema) {}

  // Static helper for clean syntax in Controllers
  static for<S extends ZodSchema>(schema: S): ZodValidationPipe<S> {
    return new ZodValidationPipe(schema);
  }

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Allows validation for body, query, and path params
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = this.formatErrors(result.error);

      if (process.env.NODE_ENV !== 'production') {
        const target = metadata.data ? `[${metadata.type}: ${metadata.data}]` : `[${metadata.type}]`;
        this.logger.warn(
          `Validation failed for ${target}:\n` + JSON.stringify(errors, null, 2),
        );
      }

      this.throwValidationError(errors);
    }

    // Returns sanitized/coerced data from Zod
    return result.data;
  }

  private formatErrors(error: ZodError): ValidationErrorItem[] {
    return error.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join('.') : 'root',
      message: issue.message,
      ...(process.env.NODE_ENV !== 'production' && {
        received: String((issue as any).received ?? ''),
      }),
    }));
  }

  private throwValidationError(errors: ValidationErrorItem[]): never {
    throw new BadRequestException({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Input validation failed',
      errors,
    });
  }
}