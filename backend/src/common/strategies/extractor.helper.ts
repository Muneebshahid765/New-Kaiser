/*eslint-disable*/
import { Request } from 'express';

export const unifiedCookieOrBearerExtractor =
  (cookieNames: string[]) =>
  (req: Request): string | null => {
    // 1. Check Cookies
    if (req?.cookies) {
      for (const name of cookieNames) {
        if (req.cookies[name]) return req.cookies[name];
      }
    }

    // 2. Check Authorization Header (Bearer)
    const authHeader = req?.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    return null;
  };