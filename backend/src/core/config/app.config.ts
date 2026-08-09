/*eslint-disable*/
import { registerAs } from '@nestjs/config';

// ─── Redis Config ─────────────────────────────────────────────────────────────
export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
}));



// ─── App Config ───────────────────────────────────────────────────────────────
export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  env: process.env.APP_ENV || 'development', 
}));