import { OrderStatus, PaymentStatus, PaymentMethod } from "../schemas/order.schema";


export interface OrderItemDetail {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string | null; // Added image field
  product?: {
    name?: string;
    images?: { url: string }[];
  };
}

export interface OrderShippingAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  subtotal: number;         // Added subtotal
  deliveryCharges: number;  // Added deliveryCharges
  totalAmount: number;
  orderNotes?: string | null;     // Added orderNotes
  trackingNumber?: string | null; // Added trackingNumber
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: OrderShippingAddress;
  items: OrderItemDetail[];
  buyerProfile?: {
    firstName: string;
    lastName: string;
    user: { email: string };
  };
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  itemCount?: number;
  items?: Array<{
    product: {
      name: string;
      images: { url: string }[];
    };
  }>;
}

export interface OrderPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface OrderStatistics {
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  newOrdersToday: number;
}

export interface GetAllOrdersResponse {
  success: boolean;
  orders: OrderListItem[];
  pagination: OrderPaginationMeta;
  statistics: OrderStatistics;
}

export interface OrderDetailsResponse {
  success: boolean;
  order: OrderDetail;
}

export interface OrderMessageResponse {
  success: boolean;
  message: string;
  order?: Partial<OrderDetail>;
}

export interface OrdersStatisticsResponse {
  success: boolean;
  statistics: OrderStatistics;
}