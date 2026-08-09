/*eslint-disable*/
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

interface TokenOptions {
  secretKey: string;
  expireKey?: string;
  defaultExpire?: string;
}

export const generateAuthToken = (
  jwtService: JwtService,
  configService: ConfigService,
  payload: JwtPayload,
  options: TokenOptions,
): string => {
  const secret =
    configService.get<string>(options.secretKey) ??
    configService.get<string>('JWT_SECRET') ??
    'fallbackSecretKey';

  const rawExpiresIn =
    (options.expireKey ? configService.get<string>(options.expireKey) : null) ??
    options.defaultExpire ??
    '7d';

  return jwtService.sign(payload, {
    secret,
    expiresIn: rawExpiresIn as any,
  });
};

export const getAuthCookieOptions = (
  configService: ConfigService,
  cookieExpireKey: string,
): CookieOptions => {
  const days = Number(configService.get(cookieExpireKey)) || 7;

  return {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: configService.get('NODE_ENV') === 'production',
    sameSite: 'lax',
    path: '/',
  };
};