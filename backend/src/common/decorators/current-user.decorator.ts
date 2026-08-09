import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRole } from './roles.decorator';

export interface RequestUser {
  /** Admin.id or Buyer.id (uuid) */
  id: string;
  email: string;
  role: AppRole;
}

export const CurrentUser = createParamDecorator(
  (field: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return field ? user[field] : user;
  },
);