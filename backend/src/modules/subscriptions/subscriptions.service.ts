/*eslint-disable*/
import {
  Injectable, BadRequestException, NotFoundException, ConflictException,
} from '@nestjs/common'
import { PrismaService }  from 'src/core/database/prisma.service'
import { StripeService }  from 'src/core/stripe/stripe.service'
import { CacheService }   from 'src/core/cache/redis/cache.service'
import type {
  CreatePlanDto, UpdatePlanDto, GetSubscribersFilterDto,
} from './dto/subscriptions.dto'
import { SubscriptionStatus } from '@prisma/client'

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly stripe:  StripeService,
    private readonly cache:   CacheService,
  ) {}

  // ─── Public: Active Plans ─────────────────────────────────────────────────────
  async getPublicPlans() {
    const cacheKey = 'subscriptions:public:plans'
    const cached   = await this.cache.get(cacheKey)
    if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached

    const plans = await this.prisma.subscriptionPlan.findMany({
      where:   { isActive: true },
      include: { benefits: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    })

    const result = { success: true, data: plans }
    await this.cache.setex(cacheKey, 600, JSON.stringify(result))
    return result
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where:   { id, isActive: true },
      include: { benefits: { orderBy: { sortOrder: 'asc' } } },
    })
    if (!plan) throw new NotFoundException('Subscription plan not found')
    return { success: true, data: plan }
  }

  // ─── Admin: Plans CRUD ────────────────────────────────────────────────────────
  async adminGetAllPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      include: {
        benefits:    { orderBy: { sortOrder: 'asc' } },
        _count:      { select: { subscribers: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return { success: true, data: plans }
  }

  async adminCreatePlan(dto: CreatePlanDto) {
    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        name:           dto.name,
        description:    dto.description ?? '',
        price:          dto.price,
        originalPrice:  dto.originalPrice,
        duration:       dto.duration,
        durationType:   dto.durationType as any,
        features:       dto.features ?? [],
        discountPercent: dto.discountPercent ?? 0,
        isPopular:      dto.isPopular ?? false,
        isActive:       dto.isActive ?? true,
        sortOrder:      dto.sortOrder ?? 0,
        badge:          dto.badge,
        color:          dto.color ?? '#8B7355',
      },
    })

    await this.cache.delByPattern('subscriptions:*')
    return { success: true, message: 'Subscription plan created', data: plan }
  }

  async adminUpdatePlan(id: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) throw new NotFoundException('Subscription plan not found')

    const updated = await this.prisma.subscriptionPlan.update({
      where: { id },
      data:  {
        ...(dto.name           !== undefined && { name: dto.name }),
        ...(dto.description    !== undefined && { description: dto.description }),
        ...(dto.price          !== undefined && { price: dto.price }),
        ...(dto.originalPrice  !== undefined && { originalPrice: dto.originalPrice }),
        ...(dto.duration       !== undefined && { duration: dto.duration }),
        ...(dto.durationType   !== undefined && { durationType: dto.durationType as any }),
        ...(dto.features       !== undefined && { features: dto.features }),
        ...(dto.discountPercent !== undefined && { discountPercent: dto.discountPercent }),
        ...(dto.isPopular      !== undefined && { isPopular: dto.isPopular }),
        ...(dto.isActive       !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder      !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.badge          !== undefined && { badge: dto.badge }),
        ...(dto.color          !== undefined && { color: dto.color }),
      },
    })

    await this.cache.delByPattern('subscriptions:*')
    return { success: true, message: 'Plan updated', data: updated }
  }

  async adminDeletePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) throw new NotFoundException('Subscription plan not found')

    const activeCount = await this.prisma.userSubscription.count({
      where: { planId: id, status: 'active' },
    })
    if (activeCount > 0)
      throw new ConflictException(`Cannot delete — ${activeCount} active subscription(s) use this plan`)

    await this.prisma.subscriptionPlan.delete({ where: { id } })
    await this.cache.delByPattern('subscriptions:*')
    return { success: true, message: 'Plan deleted' }
  }

  // ─── Admin: Subscribers ───────────────────────────────────────────────────────
  async adminGetSubscribers(dto: GetSubscribersFilterDto) {
    const { page, limit, status } = dto
    const skip = (page - 1) * limit

    const where = status ? { status: status as SubscriptionStatus } : {}

    const [subscriptions, total] = await Promise.all([
      this.prisma.userSubscription.findMany({
        where,
        skip,
        take:    limit,
        include: {
          buyerProfile: { select: { firstName: true, lastName: true, user: { select: { email: true } } } },
          plan:         { select: { name: true, price: true, duration: true, durationType: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userSubscription.count({ where }),
    ])

    return {
      success: true,
      data: {
        subscriptions,
        pagination: { total, page, pages: Math.ceil(total / limit) },
      },
    }
  }

  // ─── Admin: Stats ─────────────────────────────────────────────────────────────
  async adminGetStats() {
    const cacheKey = 'subscriptions:admin:stats'
    const cached   = await this.cache.get(cacheKey)
    if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached

    const [totalPlans, activePlans, totalSubs, activeSubs, revenue] = await Promise.all([
      this.prisma.subscriptionPlan.count(),
      this.prisma.subscriptionPlan.count({ where: { isActive: true } }),
      this.prisma.userSubscription.count(),
      this.prisma.userSubscription.count({ where: { status: 'active' } }),
      this.prisma.userSubscription.aggregate({
        where: { status: { in: ['active', 'expired'] } },
        _sum:  { amount: true },
      }),
    ])

    const result = {
      success: true,
      data: {
        totalPlans, activePlans, totalSubscribers: totalSubs,
        activeSubscribers: activeSubs,
        totalRevenue: Number(revenue._sum.amount ?? 0),
      },
    }

    await this.cache.setex(cacheKey, 300, JSON.stringify(result))
    return result
  }

  // ─── Buyer: My Subscription ───────────────────────────────────────────────────
  async getMySubscription(buyerProfileId: string) {
    const sub = await this.prisma.userSubscription.findFirst({
      where:   { buyerProfileId, status: { in: ['active', 'pending', 'cancelled'] } },
      include: { plan: { include: { benefits: { orderBy: { sortOrder: 'asc' } } } } },
      orderBy: { createdAt: 'desc' },
    })

    if (!sub) return { success: true, data: null, message: 'No active subscription found' }

    // Sync with Stripe
    let stripeData: any = null
    if (sub.stripeSubscriptionId) {
      try {
        const stripeSub = await this.stripe.client.subscriptions.retrieve(sub.stripeSubscriptionId)
        stripeData = {
          status:             stripeSub.status,
          cancelAtPeriodEnd:  stripeSub.cancel_at_period_end,
          canceledAt:         stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null,
        }

        // Sync DB if Stripe differs
        if (stripeSub.cancel_at_period_end && sub.autoRenew) {
          await this.prisma.userSubscription.update({
            where: { id: sub.id },
            data:  {
              autoRenew:   false,
              cancelledAt: sub.cancelledAt ?? new Date(),
              ...(stripeSub.status === 'canceled' && { status: 'cancelled' }),
            },
          })
        }
      } catch (err: any) {
        if (err.code === 'resource_missing') {
          await this.prisma.userSubscription.update({
            where: { id: sub.id },
            data:  { status: 'cancelled', autoRenew: false, cancelledAt: sub.cancelledAt ?? new Date() },
          })
        }
      }
    }

    return { success: true, data: { ...sub, stripeData } }
  }

  // ─── Buyer: History ───────────────────────────────────────────────────────────
  async getSubscriptionHistory(buyerProfileId: string) {
    const subs = await this.prisma.userSubscription.findMany({
      where:   { buyerProfileId },
      include: { plan: { select: { name: true, price: true, duration: true, durationType: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Deduplicate by stripeSubscriptionId
    const seen = new Set<string>()
    const unique = subs.filter(s => {
      const key = s.stripeSubscriptionId ?? s.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return { success: true, data: unique }
  }

  // ─── Admin: Cancel Subscription ───────────────────────────────────────────────
  async adminCancelSubscription(subscriptionId: string, immediate: boolean) {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
    })
    if (!sub) throw new NotFoundException('Subscription not found')

    if (sub.stripeSubscriptionId) {
      if (immediate) {
        await this.stripe.client.subscriptions.cancel(sub.stripeSubscriptionId)
      } else {
        await this.stripe.client.subscriptions.update(sub.stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      }
    }

    const updated = await this.prisma.userSubscription.update({
      where: { id: subscriptionId },
      data:  {
        autoRenew:   false,
        cancelledAt: sub.cancelledAt ?? new Date(),
        ...(immediate && { status: 'cancelled' }),
      },
    })

    await this.cache.delByPattern('subscriptions:*')
    return {
      success: true,
      message: immediate ? 'Subscription cancelled immediately' : 'Scheduled to cancel at period end',
      data:    updated,
    }
  }
}