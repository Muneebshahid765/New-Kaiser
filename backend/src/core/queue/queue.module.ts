/*eslint-disable*/
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QueueHealthController } from './queue-health.controller';
import { MAIL_QUEUE } from './queue.constants'; // 👈 ab constants.ts se, queue.module.ts se nahi

const mailQueueRegistration = BullModule.registerQueue({
  name: MAIL_QUEUE,

  // 👇 BullMQ job lifecycle events (active/completed/failed waghera) ek
  // Redis Stream mein likhta hai (aapke screenshot mein "STREAM events").
  // Agar limit na lagayen to yeh bhi hamesha ke liye badhta rehta hai.
  // 1000 entries kaafi hain — purani entries khud-ba-khud trim ho jayengi.
  streams: {
    events: {
      maxLen: 1000,
    },
  },

  defaultJobOptions: {
    // Job fail ho to 3 dafa retry karega (total 3 attempts, matlab 2 retries)
    attempts: 3,
    // Har retry ke darmiyan wait time badhta jayega: ~5s, ~10s, ~20s
    // (exponential backoff — is se SMTP/network par ek sath load nahi padta)
    backoff: {
      type: 'exponential',
      delay: 5000,
    },

    // ✅ SUCCESSFUL jobs: turant delete kar dete hain.
    // Email bhej dene ke baad us job ka koi audit/debugging value nahi
    // reh jata — aur job data mein verification code/OTP jaisi sensitive
    // info bhi hoti hai, jo Redis mein zyada der reh'ni bhi security ke
    // lihaz se acha nahi. Storage-constrained VPS ke liye yeh industry
    // standard approach hai.
    removeOnComplete: true,

    // ❌ FAILED jobs: 3 din tak rakhte hain (debugging/manual resend ke
    // liye kaafi waqt), lekin max 500 tak — agar kabhi mass-failure ho
    // (jaise SMTP poore din down rahe) to bhi storage unbounded na badhe.
    removeOnFail: {
      age: 3 * 24 * 3600, // 3 din (seconds mein)
      count: 500,
    },
  },
});

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    mailQueueRegistration,
  ],
  controllers: [QueueHealthController], // 👈 testing/health endpoints
  providers: [QueueService],
  exports: [mailQueueRegistration, QueueService],
})
export class QueueModule {}

// NOTE: Aapka MailProcessor (jo alag file mein hai) agar kahin aur module
// mein already provider ke taur par register hai to woh waisay hi rehne dein.
// Agar register nahi hai to isi providers array mein MailProcessor add kar dein.