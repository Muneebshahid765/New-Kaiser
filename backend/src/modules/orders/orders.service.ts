/*eslint-disable*/
import {
  Injectable, BadRequestException, NotFoundException,
  ConflictException, HttpException, HttpStatus,
} from '@nestjs/common'
import { PrismaService }  from 'src/core/database/prisma.service'
import { CacheService }   from 'src/core/cache/redis/cache.service'
import { StripeService }  from 'src/core/stripe/stripe.service'
import { calculateGlobalDiscount, fetchActiveSiteWideDiscount } from 'src/common/utils/discount.util'
import type { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'
import type { GetOrdersFilterDto, UpdateOrderStatusDto } from './dto/get-orders.dto'
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client'
import * as crypto from 'crypto'

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_UNIQUE_PRODUCTS = 30
const MAX_PER_PRODUCT     = 30
const MAX_TOTAL_ITEMS     = 500
const RATE_LIMIT_MAX      = 10
const RATE_LIMIT_WINDOW   = 3_600_000 // 1 hour

// ─── In-process rate limiter (stateless — no Redis needed for checkout limits) ─
const rateLimitStore = new Map<string, number[]>()
setInterval(() => {
  const now = Date.now()
  for (const [key, ts] of rateLimitStore) {
    const fresh = ts.filter(t => now - t < RATE_LIMIT_WINDOW)
    fresh.length === 0 ? rateLimitStore.delete(key) : rateLimitStore.set(key, fresh)
  }
}, 1_800_000)

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma:   PrismaService,
    private readonly cache:    CacheService,
    private readonly stripe:   StripeService,
  ) {}

  // ── Rate limiter ─────────────────────────────────────────────────────────────
  private checkRateLimit(identifier: string): boolean {
    const now    = Date.now()
    const recent = (rateLimitStore.get(identifier) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW)
    if (recent.length >= RATE_LIMIT_MAX) return false
    recent.push(now)
    rateLimitStore.set(identifier, recent)
    return true
  }

  // ─── CREATE PAYMENT INTENT ────────────────────────────────────────────────────
  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    // ── Quantity guards ──────────────────────────────────────────────────────
    if (dto.items.length > MAX_UNIQUE_PRODUCTS)
      throw new BadRequestException(`Max ${MAX_UNIQUE_PRODUCTS} different products per order`)

    for (const item of dto.items) {
      if (item.quantity > MAX_PER_PRODUCT)
        throw new BadRequestException(`Max ${MAX_PER_PRODUCT} units per product — "${item.productName}" has ${item.quantity}`)
    }

    const totalItems = dto.items.reduce((s, i) => s + i.quantity, 0)
    if (totalItems > MAX_TOTAL_ITEMS)
      throw new BadRequestException(`Total items (${totalItems}) exceeds limit of ${MAX_TOTAL_ITEMS}`)

    // ── Rate limit ───────────────────────────────────────────────────────────
    if (!this.checkRateLimit(dto.customerEmail))
      throw new HttpException('Too many payment attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS)

    // ── Site-wide discount ───────────────────────────────────────────────────
    const siteWideDiscount = await fetchActiveSiteWideDiscount(this.prisma)

    // ── Buyer subscription discount ──────────────────────────────────────────
    let buyerSubscriptionDiscount = 0
    if (dto.buyerId) {
      const sub = await this.prisma.userSubscription.findFirst({
        where: { buyerProfile: { userId: dto.buyerId }, status: 'active', endDate: { gt: new Date() } },
        select: { discountPercentSnapshot: true },
      })
      if (sub?.discountPercentSnapshot) {
        buyerSubscriptionDiscount = Math.min(Math.max(Number(sub.discountPercentSnapshot), 0), 90)
      }
    }

    // ── Validate products + compute prices ────────────────────────────────────
    let calculatedSubtotal    = 0
    const validatedItems:     any[] = []
    const stockErrors:        string[] = []

    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.product, deleted: false, status: 'active' },
        select: {
          id: true, name: true, price: true, originalPrice: true,
          stockQuantity: true, deliveryCharges: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true } },
        },
      })

      if (!product)
        throw new BadRequestException(`Product not found: "${item.productName}"`)

      if (product.stockQuantity < item.quantity) {
        stockErrors.push(
          product.stockQuantity === 0
            ? `"${product.name}" is out of stock`
            : `Only ${product.stockQuantity} unit(s) of "${product.name}" available`,
        )
        continue
      }

      // Apply site-wide discount
      const withDiscount = calculateGlobalDiscount({ price: Number(product.price), originalPrice: product.originalPrice ? Number(product.originalPrice) : null }, siteWideDiscount)
      let expectedPrice  = withDiscount.price ?? Number(product.price)

      // Apply subscription discount on top
      const applySubDiscount = item.isSubscription && buyerSubscriptionDiscount > 0
      if (applySubDiscount) {
        expectedPrice = Math.max(parseFloat((expectedPrice * (1 - buyerSubscriptionDiscount / 100)).toFixed(2)), 0.01)
      }

      const itemSubtotal = parseFloat((expectedPrice * item.quantity).toFixed(2))
      calculatedSubtotal += itemSubtotal

      validatedItems.push({
        product:                    product.id,
        productName:                product.name,
        productImage:               product.images[0]?.url ?? '',
        price:                      expectedPrice,
        originalPriceSnapshot:      withDiscount.originalPrice ?? Number(product.price),
        quantity:                   item.quantity,
        subtotal:                   itemSubtotal,
        deliveryCharges:            Number(product.deliveryCharges),
        globalDiscountApplied:      (withDiscount as any).appliedDiscount > 0,
        globalDiscountPercentage:   (withDiscount as any).appliedDiscount ?? 0,
        isSubscription:             applySubDiscount,
        subscriptionDiscountPercent: applySubDiscount ? buyerSubscriptionDiscount : 0,
      })
    }

    if (stockErrors.length > 0)
      throw new BadRequestException({ message: stockErrors.join(' '), stockErrors })

    const serverDelivery = validatedItems.reduce((s, i) => s + i.deliveryCharges, 0)
    const totalAmount    = parseFloat((calculatedSubtotal + serverDelivery).toFixed(2))

    if (totalAmount < 0.5)
      throw new BadRequestException('Minimum order amount is $0.50')

    // ── Idempotency key ──────────────────────────────────────────────────────
    const fingerprint = crypto
      .createHash('sha256')
      .update(JSON.stringify(validatedItems.map(i => `${i.product}:${i.quantity}:${i.price}`).sort()))
      .digest('hex').slice(0, 24)
    const attemptTs      = Math.floor(Date.now() / 60000)
    const idempotencyKey = `pi_${dto.customerEmail.replace(/[^a-z0-9]/g, '')}_${fingerprint}_${attemptTs}`

    // ── Stripe customer ──────────────────────────────────────────────────────
    let stripeCustomerId: string | undefined
    try {
      const existing = await this.stripe.client.customers.list({ email: dto.customerEmail, limit: 1 })
      stripeCustomerId = existing.data.length > 0
        ? existing.data[0].id
        : (await this.stripe.client.customers.create({
            email: dto.customerEmail, name: dto.customerName, phone: dto.customerPhone,
            address: {
              line1: dto.shippingAddress.address1, line2: dto.shippingAddress.address2 ?? '',
              city: dto.shippingAddress.city, state: dto.shippingAddress.state,
              postal_code: dto.shippingAddress.postalCode, country: 'AO',
            },
          })).id
    } catch { /* Non-fatal */ }

    // ── Build metadata ───────────────────────────────────────────────────────
    const itemMetadata = Object.fromEntries(
      validatedItems.map((i, idx) => [`orderItem_${idx}`, JSON.stringify(i)])
    )
    const metadata: Record<string, string> = {
      customerName:    dto.customerName,
      customerEmail:   dto.customerEmail,
      customerPhone:   dto.customerPhone,
      shippingAddress: JSON.stringify(dto.shippingAddress),
      itemCount:       validatedItems.length.toString(),
      totalQuantity:   totalItems.toString(),
      subtotal:        calculatedSubtotal.toString(),
      deliveryCharges: serverDelivery.toString(),
      totalAmount:     totalAmount.toString(),
      orderNotes:      (dto.orderNotes ?? '').slice(0, 200),
      isLiveMode:      (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ?? false).toString(),
      createdAt:       new Date().toISOString(),
      ...(dto.buyerId && { buyerId: dto.buyerId }),
      ...itemMetadata,
    }

    // ── Create payment intent ────────────────────────────────────────────────
    try {
      const pi = await this.stripe.client.paymentIntents.create(
        {
          amount:   Math.round(totalAmount * 100),
          currency: 'usd',
          ...(stripeCustomerId && { customer: stripeCustomerId }),
          automatic_payment_methods: { enabled: true },
          metadata,
          description:   `Order for ${dto.customerName}`,
          receipt_email: dto.customerEmail,
        },
        { idempotencyKey },
      )

      return {
        success:         true,
        clientSecret:    pi.client_secret,
        paymentIntentId: pi.id,
        amount:          totalAmount,
        message:         'Payment intent ready.',
      }
    } catch (err: any) {
      if (err.type === 'StripeIdempotencyError')
        throw new ConflictException('A payment for this cart is already in progress. Wait a moment.')
      throw err
    }
  }

  // ─── VERIFY PAYMENT ───────────────────────────────────────────────────────────
// orders.service.ts — verifyPayment mein short wait add karo
// Agar status=processing return karna ho toh pehle 2 seconds wait karo
async verifyPayment(paymentIntentId: string) {
  if (!/^pi_[a-zA-Z0-9_]+$/.test(paymentIntentId))
    throw new BadRequestException('Invalid payment intent ID format')

  const pi = await this.stripe.client.paymentIntents.retrieve(paymentIntentId)

  if (pi.status !== 'succeeded')
    return { success: false, status: pi.status, message: 'Payment not completed' }

  // ── First check ───────────────────────────────────────────────────────────
  let order = await this.prisma.order.findUnique({
    where:  { stripePaymentIntentId: paymentIntentId },
    select: { id: true, orderNumber: true, orderStatus: true, paymentStatus: true, totalAmount: true, customerName: true, customerEmail: true },
  })

  if (order) return { success: true, status: 'completed', message: 'Payment verified and order created', order }

  // ── Webhook abhi process ho raha hai — 2 second wait karke dobara check ──
  await new Promise(r => setTimeout(r, 2000))

  order = await this.prisma.order.findUnique({
    where:  { stripePaymentIntentId: paymentIntentId },
    select: { id: true, orderNumber: true, orderStatus: true, paymentStatus: true, totalAmount: true, customerName: true, customerEmail: true },
  })

  if (order) return { success: true, status: 'completed', message: 'Payment verified and order created', order }

  // Webhook still processing — frontend polling handle karega
  return { success: true, status: 'processing', message: 'Payment verified. Order is being created...' }
}

  // ─── ORDER STATUS ─────────────────────────────────────────────────────────────
async getOrderStatus(orderId: string) {
  if (!orderId || orderId === 'undefined' || orderId === 'null')
    throw new BadRequestException('Invalid order ID')

  // Explicitly type order variable or let it infer properly
  let order: Awaited<ReturnType<typeof this.prisma.order.findUnique>> = null

  // Try by UUID first
  if (/^[0-9a-f-]{36}$/i.test(orderId)) {
    order = await this.prisma.order.findUnique({ where: { id: orderId } })
  }

  // Try by Stripe payment intent ID
  if (!order) {
    order = await this.prisma.order.findUnique({ where: { stripePaymentIntentId: orderId } })
  }

  if (!order) {
    // Try fetching from Stripe directly
    if (orderId.startsWith('pi_')) {
      try {
        const pi = await this.stripe.client.paymentIntents.retrieve(orderId)
        return {
          success: true,
          order: null,
          paymentIntent: {
            id: pi.id,
            status: pi.status,
            amount: pi.amount / 100,
            message: pi.status === 'succeeded' ? 'Payment successful. Order being processed...' : 'Payment pending',
          },
        }
      } catch { /* Fall through */ }
    }
    throw new NotFoundException('Order not found. If you just completed payment, please wait a moment.')
  }

  return {
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
    },
  }
}

  // ─── ALL ORDERS (Admin) ───────────────────────────────────────────────────────
  async getAllOrders(dto: GetOrdersFilterDto) {
    const { page, limit, orderStatus, paymentStatus, sortBy, sortOrder, search, dateFrom, dateTo } = dto
    const skip = (page - 1) * limit

    const where: Prisma.OrderWhereInput = {}
    if (orderStatus)   where.orderStatus   = orderStatus   as OrderStatus
    if (paymentStatus) where.paymentStatus = paymentStatus as PaymentStatus

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo   && { lte: new Date(dateTo)   }),
      }
    }

    if (search) {
      where.OR = [
        { customerName:  { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { orderNumber:   { contains: search, mode: 'insensitive' } },
      ]
      if (/^[0-9a-f-]{36}$/i.test(search)) {
        where.OR.push({ id: search })
      }
    }

    const [orders, totalOrders, stats] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { [sortBy ?? 'createdAt']: sortOrder ?? 'desc' },
        include: {
          items: {
            include: { product: { select: { name: true, images: { take: 1, select: { url: true } } } } },
          },
        },
      }),
      this.prisma.order.count({ where }),
      this.prisma.order.groupBy({
        by:     ['orderStatus'],
        _count: { _all: true },
        where:  { paymentStatus: { notIn: ['refunded'] } },
      }),
    ])

    const [totalRevenue, newOrdersToday] = await Promise.all([
      this.prisma.order.aggregate({
        where:   { paymentStatus: { notIn: ['refunded'] } },
        _sum:    { totalAmount: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ])

    const statMap = Object.fromEntries(stats.map(s => [s.orderStatus, s._count._all]))

    return {
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages:  Math.ceil(totalOrders / limit),
        totalOrders,
        limit,
        hasNextPage: skip + orders.length < totalOrders,
        hasPrevPage: page > 1,
      },
      statistics: {
        totalRevenue:      Number(totalRevenue._sum.totalAmount ?? 0),
        pendingOrders:     statMap['pending']     ?? 0,
        confirmedOrders:   statMap['confirmed']   ?? 0,
        processingOrders:  statMap['processing']  ?? 0,
        shippedOrders:     statMap['shipped']     ?? 0,
        deliveredOrders:   statMap['delivered']   ?? 0,
        cancelledOrders:   statMap['cancelled']   ?? 0,
        newOrdersToday,
      },
    }
  }

  // ─── UPDATE ORDER STATUS (Admin) ──────────────────────────────────────────────
  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data:  {
        orderStatus: dto.orderStatus as OrderStatus,
        ...(dto.orderStatus === 'delivered' && {
          paymentStatus: order.paymentStatus === 'pending' ? 'paid' : order.paymentStatus,
          deliveredAt:   order.deliveredAt ?? new Date(),
        }),
      },
      select: { id: true, orderNumber: true, orderStatus: true, paymentStatus: true },
    })

    await this.cache.delByPattern('orders:*')

    return { success: true, message: 'Order status updated successfully', order: updated }
  }

  // ─── ORDER DETAILS (Admin) ────────────────────────────────────────────────────
  async getOrderDetails(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where:   { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: { take: 1, select: { url: true } }, description: true } },
          },
        },
        buyerProfile: { select: { firstName: true, lastName: true, user: { select: { email: true } } } },
      },
    })

    if (!order) throw new NotFoundException('Order not found')
    return { success: true, order }
  }

  // ─── CANCEL PAYMENT (Admin) ───────────────────────────────────────────────────
  async cancelPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } })
    if (!order)              throw new NotFoundException('Order not found')
    if (order.paymentStatus === 'paid') throw new BadRequestException('Cannot cancel completed payment')

    if (order.stripePaymentIntentId) {
      try { await this.stripe.client.paymentIntents.cancel(order.stripePaymentIntentId) }
      catch (e: any) { /* Intent may already be cancelled */ }
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data:  { orderStatus: 'cancelled', paymentStatus: 'refunded' },
    })

    return { success: true, message: 'Payment cancelled successfully' }
  }

  // ─── STATISTICS (Admin) ───────────────────────────────────────────────────────
  async getStatistics() {
    const cacheKey = 'orders:statistics'
    const cached   = await this.cache.get(cacheKey)
    if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached

    const [groups, revenue, newToday] = await Promise.all([
      this.prisma.order.groupBy({
        by:     ['orderStatus'],
        _count: { _all: true },
        where:  { paymentStatus: { notIn: ['refunded'] } },
      }),
      this.prisma.order.aggregate({
        where: { paymentStatus: { notIn: ['refunded'] } },
        _sum:  { totalAmount: true },
        _count: { _all: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ])

    const m = Object.fromEntries(groups.map(g => [g.orderStatus, g._count._all]))

    const result = {
      success: true,
      statistics: {
        totalOrders:       revenue._count._all,
        totalRevenue:      Number(revenue._sum.totalAmount ?? 0),
        pendingOrders:     m['pending']     ?? 0,
        confirmedOrders:   m['confirmed']   ?? 0,
        processingOrders:  m['processing']  ?? 0,
        shippedOrders:     m['shipped']     ?? 0,
        deliveredOrders:   m['delivered']   ?? 0,
        cancelledOrders:   m['cancelled']   ?? 0,
        newOrdersToday:    newToday,
        undeliveredOrders: (revenue._count._all) - (m['delivered'] ?? 0),
      },
    }

    await this.cache.setex(cacheKey, 300, JSON.stringify(result))
    return result
  }
}