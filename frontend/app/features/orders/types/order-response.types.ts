import { OrderStatus, PaymentStatus, PaymentMethod } from "./order.type";

export interface OrderItemDetail {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPriceSnapshot?: number;
  quantity: number;
  subtotal: number;
  deliveryCharges: number;
  globalDiscountApplied: boolean;
  globalDiscountPercentage: number;
  isSubscription: boolean;
}

export interface OrderShippingAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ─── GET /orders (List Item) ────────────────────────────────────────────────
export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── GET /orders/:id (Full Detail) ─────────────────────────────────────────
export interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: OrderShippingAddress;
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentIntentStatus?: string;
  stripePaymentIntentId?: string;
  orderNotes?: string;
  items: OrderItemDetail[];
  createdAt: string;
  updatedAt: string;
}

// ─── Message / Generic Responses ───────────────────────────────────────────
export interface OrderMessageResponse {
  success: boolean;
  message: string;
}

export interface OrdersSummaryResponse {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}