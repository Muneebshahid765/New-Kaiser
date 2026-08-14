import { OrderStatus, PaymentMethod, PaymentStatus } from "../schemas/buyer-order.schema";

export interface BuyerOrderItemPreview {
  id: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
}

export interface BuyerOrderListItem {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  totalItemsCount: number;
  previewItems: BuyerOrderItemPreview[];
}

export interface BuyerOrderPagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetBuyerOrdersResponse {
  success: boolean;
  orders: BuyerOrderListItem[];
  pagination: BuyerOrderPagination;
}

export interface BuyerOrderItemDetail {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  isSubscription: boolean;
  image: string | null;
}

export interface BuyerShippingAddress {
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BuyerOrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  orderNotes?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  deliveredAt?: string | null;
  shippingAddress: BuyerShippingAddress;
  items: BuyerOrderItemDetail[];
}

export interface GetBuyerOrderDetailResponse {
  success: boolean;
  order: BuyerOrderDetail;
}

export interface CancelBuyerOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    orderStatus: OrderStatus;
    updatedAt: string;
  };
}