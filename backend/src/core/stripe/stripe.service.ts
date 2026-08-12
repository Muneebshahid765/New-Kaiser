import { Injectable } from '@nestjs/common'
import Stripe from 'stripe'

@Injectable()
export class StripeService {
  readonly client: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia', 
  typescript: true,
  })
}