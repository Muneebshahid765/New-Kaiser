import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { json } from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
      rawBody: true,
    });

    // 1. Helmet Security Options (Updated to allow cross-origin images)
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // 👈 ADDED: Solves ERR_BLOCKED_BY_RESPONSE
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:', 'http:'],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      }),
    );

    // Cookie Parser Middleware
    app.use(cookieParser());

    // 2. Serve uploads/ with explicit Cross-Origin header
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // 👈 ADDED
      },
    });

    // 3. Global Prefix
    app.setGlobalPrefix('api');

    // 4. Payload Limit
    app.use(json({ limit: '10mb' }));

    // 5. CORS Policy
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3001',
          'http://localhost:3000',
          'https://africakaiser.co.uk',
          'https://www.africakaiser.co.uk',
        ];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // 6. Graceful Shutdown
    app.enableShutdownHooks();

    const port = Number(process.env.PORT) || 3000;

    await app.listen(port);

    logger.log('────────────────────────────────────────────');
    logger.log('🚀 AfricaKaiser Backend Started Successfully');
    logger.log(`🌍 Environment : ${process.env.NODE_ENV ?? 'development'}`);
    logger.log(`📡 Server      : http://localhost:${port}`);
    logger.log(`📖 API Base    : http://localhost:${port}/api`);
    logger.log(`🖼️  Static      : http://localhost:${port}/uploads`);
    logger.log('────────────────────────────────────────────');
  } catch (error) {
    logger.error('❌ Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();