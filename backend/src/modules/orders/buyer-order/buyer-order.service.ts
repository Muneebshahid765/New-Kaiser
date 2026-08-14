import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service'; // Adjust path according to your project structure
import { GetBuyerOrdersDto } from '../dto/buyer-order.dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class BuyerOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  
 // ─── 1. GET ALL MY ORDERS (BUYER) ─────────────────────────────────────────
 async getMyOrders(
    userId: string, // 👈 Passing logged-in User ID directly from req.user.id
    userEmail: string, // 👈 Passing req.user.email
    dto: GetBuyerOrdersDto,
  ) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const { orderStatus } = dto;

    const skip = (page - 1) * limit;

    // 🏽 FIX: Prisma Relation Query
    // Yeh check karega ke Order ka BuyerProfile belongs to this User ID OR Email matches.
    const where: Prisma.OrderWhereInput = {
      OR: [
        {
          buyerProfile: {
            userId: userId, // ✅ FIX: Relation traverse karke userId match karega
          },
        },
        {
          customerEmail: {
            equals: userEmail,
            mode: 'insensitive', // ✅ Case-insensitive email fallback
          },
        },
      ],
    };

    // Agar status filter filter apply hua ho
    if (orderStatus && (orderStatus as string) !== 'all') {
      where.orderStatus = orderStatus as OrderStatus;
    }

    const [orders, totalOrders] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          orderStatus: true,
          paymentStatus: true,
          paymentMethod: true,
          createdAt: true,
          items: {
            take: 2,
            select: {
              id: true,
              productName: true,
              productImage: true,
              quantity: true,
              price: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return {
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: Number(order.totalAmount),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        totalItemsCount: order._count.items,
        previewItems: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

// ─── 2. GET SINGLE ORDER DETAIL (BUYER) ───────────────────────────────────
async getMyOrderDetail(
  orderId: string,
  userId: string, // 👈 Expecting userId now
  userEmail: string,
) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      buyerProfileId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      subtotal: true,
      deliveryCharges: true,
      totalAmount: true,
      orderStatus: true,
      paymentMethod: true,
      paymentStatus: true,
      orderNotes: true,
      trackingNumber: true,
      createdAt: true,
      deliveredAt: true,
      shippingAddress1: true,
      shippingAddress2: true,
      shippingCity: true,
      shippingState: true,
      shippingPostalCode: true,
      shippingCountry: true,
      // 🏽 Buyer Profile ka userId fetch karein authorization ke liye
      buyerProfile: {
        select: {
          userId: true,
        },
      },
      items: {
        select: {
          id: true,
          productId: true,
          productName: true,
          productImage: true,
          price: true,
          quantity: true,
          subtotal: true,
          isSubscription: true,
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
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // 🏽 RELIABLE AUTHORIZATION CHECK
  // 1. Direct Relation Check: Order ka BuyerProfile belongs to this User ID
  const isOwnerByProfile = order.buyerProfile?.userId === userId;

  // 2. Email Fallback Check (Case-insensitive)
  const isOwnerByEmail =
    Boolean(order.customerEmail) &&
    Boolean(userEmail) &&
    order.customerEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();

  if (!isOwnerByProfile && !isOwnerByEmail) {
    throw new ForbiddenException(
      'You do not have permission to view this order',
    );
  }

  // Transform response cleanly
  return {
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      deliveryCharges: Number(order.deliveryCharges),
      totalAmount: Number(order.totalAmount),
      orderNotes: order.orderNotes,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      shippingAddress: {
        address1: order.shippingAddress1,
        address2: order.shippingAddress2,
        city: order.shippingCity,
        state: order.shippingState,
        postalCode: order.shippingPostalCode,
        country: order.shippingCountry,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        isSubscription: item.isSubscription,
        image: item.productImage || item.product?.images[0]?.url || null,
      })),
    },
  };
}

// ─── 3. CANCEL ORDER (BUYER) ──────────────────────────────────────────────
async cancelMyOrder(
  orderId: string,
  userId: string, // 👈 Expecting userId now
  userEmail: string,
) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      customerEmail: true,
      orderStatus: true,
      buyerProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // 🏽 RELIABLE AUTHORIZATION CHECK
  const isOwnerByProfile = order.buyerProfile?.userId === userId;

  const isOwnerByEmail =
    Boolean(order.customerEmail) &&
    Boolean(userEmail) &&
    order.customerEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();

  if (!isOwnerByProfile && !isOwnerByEmail) {
    throw new ForbiddenException(
      'You do not have permission to modify this order',
    );
  }

  if (
    order.orderStatus !== OrderStatus.pending &&
    order.orderStatus !== OrderStatus.confirmed
  ) {
    throw new BadRequestException(
      `Order cannot be cancelled as it is currently in '${order.orderStatus}' status`,
    );
  }

  const updatedOrder = await this.prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: OrderStatus.cancelled },
    select: { id: true, orderStatus: true, updatedAt: true },
  });

  return {
    success: true,
    message: 'Order cancelled successfully',
    order: updatedOrder,
  };
}
  
}