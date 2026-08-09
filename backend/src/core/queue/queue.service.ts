/*eslint-disable*/
import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Redis } from 'ioredis'; // 👈 IRedisClient ka type-cast karne ke liye
import { MAIL_QUEUE } from './queue.constants'; // 👈 fixed import path
import { SendMailOptions } from '../mail/mail.service';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @Inject(getQueueToken(MAIL_QUEUE)) private readonly mailQueue: Queue,
  ) {}

  // App start hotay hi Redis connection ke events sunna shuru kar dete hain.
  // ⚠️ IMPORTANT: yahan `await` NAHI use karna — `mailQueue.client` us waqt tak
  // resolve nahi hota jab tak Redis 'ready' state mein na aa jaye. Agar Redis
  // down/unreachable ho to yeh Promise kabhi resolve nahi hota, aur NestJS
  // onModuleInit ko await karta hai — is se poora app bootstrap hamesha ke
  // liye latak jata hai (bilkul woh symptom jo dekha: sirf tsc compile ke
  // baad kuch print hi nahi hota). Isliye .then()/.catch() use karte hain
  // taake app boot ho jaye chahe Redis abhi ready na ho.
  onModuleInit() {
    this.mailQueue.on('error', (err) => {
      this.logger.error(`❌ Queue-level error: ${err.message}`);
    });

    this.mailQueue.client
      .then((rawClient) => {
        const client = rawClient as unknown as Redis;

        client.on('connect', () =>
          this.logger.log('✅ Redis connected successfully'),
        );
        client.on('ready', () =>
          this.logger.log('✅ Redis client ready — BullMQ jobs process kar sakta hai'),
        );
        client.on('error', (err) =>
          this.logger.error(`❌ Redis connection error: ${err.message}`),
        );
        client.on('close', () =>
          this.logger.warn('⚠️ Redis connection band ho gayi'),
        );
        client.on('reconnecting', () =>
          this.logger.warn('🔄 Redis se dobara connect karne ki koshish...'),
        );

        if (client.status === 'ready') {
          this.logger.log('✅ Redis pehle se hi connected aur ready hai');
        }
      })
      .catch((err) => {
        this.logger.error(`❌ Redis client hasil nahi ho saka: ${err.message}`);
      });
  }

  async addMailToQueue(jobName: string, mailOptions: SendMailOptions) {
    try {
      const job = await this.mailQueue.add(jobName, mailOptions);
      this.logger.log(`Job #${job.id} [${jobName}] added to Mail Queue`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add job [${jobName}] to Mail Queue`, error);
      throw error;
    }
  }

  /**
   * Testing/monitoring ke liye — Redis ping karta hai aur queue ke
   * job counts (waiting/active/completed/failed/delayed) wapas deta hai.
   */
  async checkHealth() {
    try {
      // 👇 Agar Redis down ho to `mailQueue.client` kabhi resolve nahi hota,
      // isliye 3 second ka timeout laga dete hain taake request latka na rahe
      const client = (await Promise.race([
        this.mailQueue.client,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis client timeout (3s) — Redis shayad down hai')), 3000),
        ),
      ])) as unknown as Redis;

      const pong = await client.ping();

      const counts = await this.mailQueue.getJobCounts(
        'waiting',
        'active',
        'completed',
        'failed',
        'delayed',
      );

      return {
        redis: pong === 'PONG' ? 'connected' : 'unknown',
        clientStatus: client.status,
        jobCounts: counts,
      };
    } catch (error) {
      return {
        redis: 'disconnected',
        error: error.message,
      };
    }
  }
}