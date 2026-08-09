/*eslint-disable*/
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export enum AppRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  BUYER = 'buyer',
}

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);