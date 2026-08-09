import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const RawBody = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Buffer | undefined => {
    const request = ctx.switchToHttp().getRequest<Request & { rawBody?: Buffer }>();
    return request.rawBody;
  },
);