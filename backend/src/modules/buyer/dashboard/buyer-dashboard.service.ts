import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { OrderStatus, ProductStatus } from '@prisma/client';

@Injectable()
export class BuyerDashboardService {
  private readonly logger = Logger.name;

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardOverview(userId: string, recentLimit = 4) {
    if (!userId) {
      throw new BadRequestException('User ID is missing or invalid');
    }

    try {
      // 1. Fetch Buyer Profile with relations
      const buyerProfile = await this.prisma.buyerProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isVerified: true,
          createdAt: true,
          user: { select: { email: true } },
          _count: { select: { addresses: true } },
          subscriptions: {
            where: { status: 'active' },
            take: 1,
            select: { plan: { select: { name: true } } },
          },
        },
      });

      if (!buyerProfile) {
        throw new NotFoundException('Buyer profile not found');
      }

      // Date baseline for current month metrics calculations
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // 2. Execute High-Performance Parallelized DB Operations
      const [
        totalOrdersCount,
        totalOrdersThisMonth,
        pendingOrdersCount,
        pendingOrdersThisMonth,
        confirmedOrdersCount,
        confirmedOrdersThisMonth,
        deliveredOrdersCount,
        deliveredOrdersThisMonth,
        recentOrders,
        orderStatusBreakdown,
        spendingAgg,
        recommendedProducts,
      ] = await Promise.all([
        // Metric 1: Total Orders Count
        this.prisma.order.count({
          where: { buyerProfileId: buyerProfile.id },
        }),

        // Metric 1 Comparison: Total Orders Created This Month
        this.prisma.order.count({
          where: {
            buyerProfileId: buyerProfile.id,
            createdAt: { gte: firstDayOfMonth },
          },
        }),

        // Metric 2: Pending/Processing Orders Count
        this.prisma.order.count({
          where: {
            buyerProfileId: buyerProfile.id,
            orderStatus: { in: [OrderStatus.pending, OrderStatus.processing] },
          },
        }),

        // Metric 2 Comparison: Pending Created This Month
        this.prisma.order.count({
          where: {
            buyerProfileId: buyerProfile.id,
            orderStatus: { in: [OrderStatus.pending, OrderStatus.processing] },
            createdAt: { gte: firstDayOfMonth },
          },
        }),

        // Metric 3: Confirmed Orders Count
        this.prisma.order.count({
          where: {
            buyerProfileId: buyerProfile.id,
            orderStatus: OrderStatus.confirmed,
          },
        }),

        // Metric 3 Comparison: Confirmed Created This Month
        this.prisma.order.count({
          where: {
            buyerProfileId: buyerProfile.id,
            orderStatus: OrderStatus.confirmed,
            createdAt: { gte: firstDayOfMonth },
          },
        }),

        // Metric 4: Delivered Orders Count
        this.prisma.order.count({
          where: {
            buyerProfileId: buyerProfile.id,
            orderStatus: OrderStatus.delivered,
          },
        }),

        // Metric 4 Comparison: Delivered This Month
        this.prisma.order.count({
          where: {
            buyerProfileId: buyerProfile.id,
            orderStatus: OrderStatus.delivered,
            createdAt: { gte: firstDayOfMonth },
          },
        }),

        // Recent Orders List (Dashboard Section)
        this.prisma.order.findMany({
          where: { buyerProfileId: buyerProfile.id },
          take: recentLimit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            orderStatus: true,
            totalAmount: true,
            createdAt: true,
            items: {
              take: 1,
              select: {
                productName: true,
                productImage: true,
                product: {
                  select: {
                    images: {
                      take: 1,
                      select: { url: true },
                    },
                  },
                },
              },
            },
          },
        }),

        // Order Status Breakdown for Donut Chart Widget
        this.prisma.order.groupBy({
          by: ['orderStatus'],
          where: { buyerProfileId: buyerProfile.id },
          _count: { orderStatus: true },
        }),

        // Account Total Spending Aggregate
        this.prisma.order.aggregate({
          where: {
            buyerProfileId: buyerProfile.id,
            paymentStatus: 'paid',
          },
          _sum: { totalAmount: true },
        }),

        // Recommended Products Carousel / Grid
        this.prisma.product.findMany({
          where: { status: ProductStatus.active, deleted: false },
          take: 4,
          orderBy: { averageRating: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            averageRating: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        }),
      ]);

      // Calculate Reward Points Formula: 1 Point for every $1 spent
      const totalSpent = Number(spendingAgg._sum.totalAmount ?? 0);
      const rewardPoints = Math.floor(totalSpent);

      // Process Donut Chart Status Totals
      const statusCounts = {
        delivered: 0,
        shipped: 0,
        processing: 0,
        cancelled: 0,
        pending: 0,
        confirmed: 0,
      };

      orderStatusBreakdown.forEach((group) => {
        if (group.orderStatus in statusCounts) {
          statusCounts[group.orderStatus] = group._count.orderStatus;
        }
      });

      // 3. Construct Clean Enterprise Structured Payload
      return {
        success: true,
        data: {
          // Top Welcome / User Badge Info
          user: {
            id: buyerProfile.id,
            fullName: `${buyerProfile.firstName} ${buyerProfile.lastName}`.trim(),
            email: buyerProfile.user.email,
            isVerified: buyerProfile.isVerified,
            accountType:
              buyerProfile.subscriptions[0]?.plan.name || 'Standard Buyer',
          },

          // Top Cards Metrics Metadata
          metrics: {
            totalOrders: {
              value: totalOrdersCount,
              changeThisMonth: `+${totalOrdersThisMonth} this month`,
            },
            pendingOrders: {
              value: pendingOrdersCount,
              changeThisMonth: `+${pendingOrdersThisMonth} new`,
            },
            confirmOrders: {
              value: confirmedOrdersCount,
              changeThisMonth: `+${confirmedOrdersThisMonth} this month`,
            },
            deliveredOrders: {
              value: deliveredOrdersCount,
              changeThisMonth: `+${deliveredOrdersThisMonth} this month`,
            },
            rewardPoints: {
              value: rewardPoints,
              changeThisMonth: `+${Math.floor(totalOrdersThisMonth * 10)} this month`,
            },
          },

          // Recent Orders Section
          recentOrders: recentOrders.map((order) => {
            const firstItem = order.items[0];
            return {
              id: order.id,
              orderNumber: order.orderNumber,
              title: firstItem?.productName || 'Order Items',
              totalAmount: Number(order.totalAmount),
              status: order.orderStatus,
              image:
                firstItem?.productImage ||
                firstItem?.product?.images[0]?.url ||
                null,
              createdAt: order.createdAt,
            };
          }),

          // Order Status Donut Chart Data
          orderStatusChart: {
            total: totalOrdersCount,
            breakdown: {
              delivered: statusCounts.delivered,
              shipped: statusCounts.shipped,
              processing: statusCounts.processing,
              cancelled: statusCounts.cancelled,
              confirmed: statusCounts.confirmed,
              pending: statusCounts.pending,
            },
          },

          // Recommended Products Section
          recommendedProducts: recommendedProducts.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            rating: Number(product.averageRating),
            image: product.images[0]?.url || null,
          })),

          // Account Summary Side Card
          accountSummary: {
            memberSince: buyerProfile.createdAt,
            accountType:
              buyerProfile.subscriptions[0]?.plan.name || 'Standard Buyer',
            totalSpent: totalSpent,
            savedAddressesCount: buyerProfile._count.addresses,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to construct buyer dashboard overview',
      );
    }
  }
}