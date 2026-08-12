import {
  Controller, Post, Res, Headers, HttpCode
} from '@nestjs/common'
import type { Response } from 'express'
import { WebhooksService }   from './webhooks.service'
import { Public }            from 'src/common/decorators/public.decorator'
import { StripeService }     from 'src/core/stripe/stripe.service'
import { RawBody } from 'src/common/decorators/raw-body.decorator'

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly stripe:          StripeService,
  ) {}

 @Public()
@Post('stripe')
@HttpCode(200)
async handleStripeWebhook(
  @RawBody() rawBody: Buffer,                
  @Res() res: Response,
  @Headers('stripe-signature') sig: string,
) {
  let event: any

  try {
    // Agar rawBody na mile toh log karein
    if (!rawBody) {
      console.error('❌ Webhook Error: rawBody is undefined or empty');
    }

    event = this.stripe.client.webhooks.constructEvent(
      rawBody,                                
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err: any) {
    // 👈 Is log se terminal me exact signature error nazar aayega
    console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Respond 200 immediately
  res.json({ received: true })

  this.webhooksService.processEvent(event).catch(err =>
    console.error(`❌ Webhook processing error [${event.type}]:`, err.message),
  )
}
}