/*eslint-disable*/
import { Controller, Get } from '@nestjs/common';
import { QueueService } from './queue.service';

/**
 * Yeh controller sirf testing/monitoring ke liye hai.
 * GET /health/queue        -> Redis + queue ka current status
 * GET /health/queue/test   -> Ek dummy job daal ke dekhta hai worker process kar raha hai ya nahi
 */
@Controller('health')
export class QueueHealthController {
  constructor(private readonly queueService: QueueService) {}

  @Get('queue')
  async checkQueueHealth() {
    return this.queueService.checkHealth();
  }

  @Get('queue/test')
  async addTestJob() {
    const job = await this.queueService.addMailToQueue(
      'send_verification_email',
      {
        to: 'comender76@gmail.com',
        subject: 'Test Email — Queue Check',
        template: 'verification',
        context: {
          firstName: 'Test User',
          verificationCode: '123456',
        },
      },
    );

    return {
      message: 'Test job queue mein daal di gayi',
      jobId: job.id,
      jobState: await job.getState(),
    };
  }
}