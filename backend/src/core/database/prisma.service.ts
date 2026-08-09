/* eslint-disable */
import {
  Injectable,
  INestApplication,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'pretty',
    });

    // Query Logging (Development Only)
    if (process.env.NODE_ENV !== 'production') {
      this.$on('query' as never, (e: any) => {
        this.logger.debug(
          `Query: ${e.query}\nDuration: ${e.duration}ms`,
        );
      });
    }

    this.$on('warn' as never, (e: any) => {
      this.logger.warn(e.message);
    });

    this.$on('error' as never, (e: any) => {
      this.logger.error(e.message);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('❌ Database connection closed');
  }

  

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });

  }
  joinPrismaUuidArray(ids: string[]): Prisma.Sql {
    if (!ids || ids.length === 0) return Prisma.sql`NULL`;
    return Prisma.join(ids.map((id) => Prisma.sql`${id}::uuid`));
  }
}