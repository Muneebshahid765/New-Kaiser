/*eslint-disable*/
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService, SendMailOptions } from '../../mail/mail.service';
import { MAIL_QUEUE } from '../queue.constants'; // 👈 fixed import path

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<SendMailOptions>): Promise<any> {
    this.logger.log(
      `Processing Job ID #${job.id} [${job.name}] for ${job.data.to}`,
    );

    switch (job.name) {
      case 'send_verification_email':
      case 'send_welcome_email':
      case 'send_password_reset_email':
        await this.mailService.sendMail(job.data);
        break;

      default:
        this.logger.warn(`Unknown email job type: ${job.name}`);
    }
  }

  // 👇 Yeh events confirm karte hain ke worker Redis se connect hai
  // aur jobs actually pick/process kar raha hai
  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`▶️ Job ${job.id} [${job.name}] processing shuru hui`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Job ${job.id} [${job.name}] complete ho gayi`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `❌ Job ${job?.id} [${job?.name}] fail ho gayi: ${err.message}`,
    );
  }

  @OnWorkerEvent('error')
  onError(err: Error) {
    this.logger.error(`❌ Worker-level error: ${err.message}`);
  }
}