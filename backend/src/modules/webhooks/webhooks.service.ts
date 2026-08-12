/*eslint-disable*/
import { Injectable }       from '@nestjs/common'
import { PrismaService }    from 'src/core/database/prisma.service'
import { CacheService }     from 'src/core/cache/redis/cache.service'
import { StripeService }    from 'src/core/stripe/stripe.service'
// import { EmailService }     from 'src/core/email/email.service'
import { decrementStock, incrementStock } from 'src/common/utils/stock.util'
import { ImageDedupService } from '../uploads/services/image.service'
import path from 'path'
import * as fs from 'fs/promises'
import { ImageFolder, UsageModel } from 'generated/prisma/enums'

// ─── Order number generator ───────────────────────────────────────────────────
const generateOrderNumber = () =>
  `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma:       PrismaService,
    private readonly cache:        CacheService,
    // private readonly stripe:       StripeService,
    // private readonly email:        EmailService,
    private readonly imageService: ImageDedupService,
  ) {}

  async processEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object)
        break
      case 'payment_intent.canceled':
        await this.handlePaymentCanceled(event.data.object)
        break
      case 'charge.refunded':
        await this.handleRefund(event.data.object)
        break
      case 'payment_intent.requires_action':
        await this.handleRequiresAction(event.data.object)
        break
      default:
        break
    }
  }

  // ─── PAYMENT SUCCESS ──────────────────────────────────────────────────────────
  private async handlePaymentSuccess(pi: any) {
    const t0 = Date.now()
    console.log(`🔔 Payment success: ${pi.id}`)

    const metadata = pi.metadata ?? {}
    if (metadata.type === 'subscription') return

    const itemCount = parseInt(metadata.itemCount ?? '0')
    if (!itemCount || itemCount > 30) {
      console.error(`❌ Invalid itemCount (${itemCount}) for ${pi.id}`)
      return
    }

    // ── Parse order items from metadata ─────────────────────────────────────
    const orderItems: any[] = []
    for (let i = 0; i < itemCount; i++) {
      const raw = metadata[`orderItem_${i}`]
      if (!raw) { console.error(`❌ Missing orderItem_${i} for ${pi.id}`); return }
      try { orderItems.push(JSON.parse(raw)) }
      catch { console.error(`❌ Invalid JSON in orderItem_${i} for ${pi.id}`); return }
    }

    let shippingAddress: any
    try { shippingAddress = JSON.parse(metadata.shippingAddress ?? '{}') }
    catch { console.error(`❌ Invalid shippingAddress for ${pi.id}`); return }
    if (!shippingAddress.address1) { console.error(`❌ Incomplete address for ${pi.id}`); return }

    // ── Find buyer profile ───────────────────────────────────────────────────
    let buyerProfileId: string | undefined
    if (metadata.buyerId) {
      const profile = await this.prisma.buyerProfile.findFirst({
        where: { user: { id: metadata.buyerId } },
        select: { id: true },
      })
      buyerProfileId = profile?.id
    }

    const itemsWithSnapshots = await Promise.all(
      orderItems.map(async (item) => {
        const snapshot = await this.createOrderImageSnapshot(item.productImage)
        return { ...item, productImage: snapshot ?? item.productImage ?? '' }
      }),
    )

    // ── Atomic upsert ────────────────────────────────────────────────────────
    const orderData: any = {
      ...(buyerProfileId && { buyerProfile: { connect: { id: buyerProfileId } } }),
      orderNumber:          generateOrderNumber(),
      customerName:         metadata.customerName,
      customerEmail:        metadata.customerEmail,
      customerPhone:        metadata.customerPhone,
      shippingAddress1:    shippingAddress.address1,
      shippingAddress2:    shippingAddress.address2 ?? '',
      shippingCity:        shippingAddress.city,
      shippingState:       shippingAddress.state,
      shippingPostalCode:  shippingAddress.postalCode,
      shippingCountry:     shippingAddress.country ?? 'Pakistan',
      subtotal:            parseFloat(metadata.subtotal),
      deliveryCharges:     parseFloat(metadata.deliveryCharges ?? '0'),
      totalAmount:         parseFloat(metadata.totalAmount),
      paymentMethod:       'card',
      paymentStatus:       'paid',
      orderStatus:         'confirmed',
      stripePaymentIntentId: pi.id,
      stripeChargeId:      pi.latest_charge,
      stripeCustomerId:    pi.customer,
      paymentIntentStatus: 'succeeded',
      orderNotes:          metadata.orderNotes ?? '',
      items: {
        create: itemsWithSnapshots.map(i => ({
          product:                 { connect: { id: i.product } },
          productName:             i.productName,
          productImage:            i.productImage ?? '',
          price:                   Number(i.price),
          originalPriceSnapshot:   i.originalPriceSnapshot,
          quantity:                Number(i.quantity),
          subtotal:                Number(i.subtotal),
          deliveryCharges:         Number(i.deliveryCharges) || 0,
          globalDiscountApplied:   Boolean(i.globalDiscountApplied),
          globalDiscountPercentage: Number(i.globalDiscountPercentage) || 0,
          isSubscription:          Boolean(i.isSubscription),
          subscriptionDiscountPercent: Number(i.subscriptionDiscountPercent) || 0,
        })),
      },
    }

    let order: any
    try {
      order = await this.prisma.order.upsert({
        where:  { stripePaymentIntentId: pi.id },
        update: {},
        create: orderData,
        include: { items: true },
      })
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(`✅ Duplicate webhook ignored for ${pi.id}`)
        return
      }
      throw err
    }

    console.log(`✅ Order ${order.orderNumber} created in ${Date.now() - t0}ms`)

    // ── Register Image Usage References (Order Creation ke foran baad) ──────
    try {
      for (const item of order.items) {
        if (!item.productImage) continue

        const asset = await this.prisma.imageAsset.findUnique({
          where: { path: item.productImage },
        })

        if (asset) {
          await this.imageService.addUsageRef(
            asset.id,
            UsageModel.order,
            order.id,
            `productImage_${item.id}`,
          )
        }
      }
    } catch (refErr: any) {
      console.warn(`⚠️ Image ref registration failed for ${order.orderNumber}:`, refErr.message)
    }

    // ── Decrement stock ──────────────────────────────────────────────────────
    const stockErrors = await decrementStock(
      this.prisma,
      this.cache,
      orderItems.map(i => ({ productId: i.product, quantity: Number(i.quantity) })),
    )
    if (stockErrors.length > 0) {
      console.warn(`⚠️ Stock issues for ${order.orderNumber}:`, stockErrors)
      await this.prisma.order.update({
        where: { id: order.id },
        data:  { orderNotes: `[STOCK ALERT] ${stockErrors.map(e => e.reason).join('; ')}` },
      })
    }

    // ── Invalidate caches ────────────────────────────────────────────────────
    await this.cache.delByPattern('orders:*')

    // ── Send emails (non-blocking) ───────────────────────────────────────────
    // this.email.sendOrderConfirmation(order).catch(err =>
    //   console.error(`❌ Email failed for ${order.orderNumber}:`, err.message),
    // )

    console.log(`✅ Webhook done in ${Date.now() - t0}ms`)
  }

  // ─── PAYMENT FAILED ───────────────────────────────────────────────────────────
  private async handlePaymentFailed(pi: any) {
    const order = await this.prisma.order.findUnique({ where: { stripePaymentIntentId: pi.id } })
    if (!order) return
    await this.prisma.order.update({
      where: { id: order.id },
      data:  { paymentStatus: 'refunded', orderStatus: 'cancelled', paymentIntentStatus: 'failed' },
    })
    console.log(`❌ Order ${order.orderNumber} marked failed`)
  }

  // ─── PAYMENT CANCELED ─────────────────────────────────────────────────────────
  private async handlePaymentCanceled(pi: any) {
    const order = await this.prisma.order.findUnique({ where: { stripePaymentIntentId: pi.id } })
    if (!order) return
    await this.prisma.order.update({
      where: { id: order.id },
      data:  { paymentStatus: 'refunded', orderStatus: 'cancelled', paymentIntentStatus: 'canceled' },
    })
    console.log(`🚫 Order ${order.orderNumber} cancelled`)
  }

  // ─── REFUND ───────────────────────────────────────────────────────────────────
  private async handleRefund(charge: any) {
    const order = await this.prisma.order.findFirst({
      where:   { stripeChargeId: charge.id },
      include: { items: true },
    })
    if (!order) { console.error(`❌ No order for charge: ${charge.id}`); return }

    const isPartial = charge.amount_refunded < charge.amount
    const refundAmt = charge.amount_refunded / 100

    await this.prisma.order.update({
      where: { id: order.id },
      data:  {
        paymentStatus: isPartial ? 'partially_refunded' : 'refunded',
        ...(!isPartial && { orderStatus: 'cancelled' }),
      },
    })

    console.log(`💰 Order ${order.orderNumber} refunded $${refundAmt.toFixed(2)}`)

    if (!isPartial && order.items.length > 0) {
      await incrementStock(
        this.prisma,
        this.cache,
        order.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      )
    }
  }

  // ─── REQUIRES ACTION ──────────────────────────────────────────────────────────
  private async handleRequiresAction(pi: any) {
    const order = await this.prisma.order.findUnique({ where: { stripePaymentIntentId: pi.id } })
    if (!order) return
    await this.prisma.order.update({
      where: { id: order.id },
      data:  { paymentIntentStatus: 'requires_action' },
    })
  }

  // ─── Helper function ─────────────────────────────────────────────────────────
  private async createOrderImageSnapshot(imagePath?: string): Promise<string | null> {
    if (!imagePath) return null

    if (/^https?:\/\//i.test(imagePath)) return imagePath

    try {
      const fullPath = path.join(process.cwd(), imagePath.replace(/^\/+/, ''))

      try { await fs.access(fullPath, fs.constants.R_OK) }
      catch { return imagePath }

      const buffer = await fs.readFile(fullPath)

      const { asset } = await this.imageService.processAndDedup(
        buffer,
        ImageFolder.order_items,
      )

      console.log(`✅ Order image snapshot: ${asset.path}`)
      return asset.path

    } catch (err: any) {
      console.error(`⚠️ Image snapshot failed for ${imagePath}:`, err.message)
      return imagePath
    }
  }
}