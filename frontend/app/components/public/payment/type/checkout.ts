// types/checkout.ts

export interface CartItem {
  product: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string | { url: string };
  images?: Array<{ url: string }>;
  deliveryCharges?: number;
  isSubscription?: boolean;
  stockQuantity?: number;
  [key: string]: any;
}

export interface ShippingAddress {
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  orderNotes: string;
}

export interface CompletedOrder {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  orderStatus: string;
}

export interface CheckoutFormProps {
  onSuccess: (order: CompletedOrder) => void;
}

export interface OrderSuccessProps {
  order: CompletedOrder | null;
  onNewCheckout: () => void;
}

export interface PaymentIntentPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: Array<{
    product: string;
    productName: string;
    price: number;
    quantity: number;
    isSubscription: boolean;
  }>;
  orderNotes: string;
  buyerId?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface VerifyPaymentPayload {
  paymentIntentId: string;
  maxAttempts?: number;
}