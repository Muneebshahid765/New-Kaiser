export interface BuyerDashboardUser {
  id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
  accountType: string;
}

export interface MetricItem {
  value: number;
  changeThisMonth: string;
}

export interface BuyerDashboardMetrics {
  totalOrders: MetricItem;
  pendingOrders: MetricItem;
  deliveredOrders: MetricItem;
  rewardPoints: MetricItem;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  title: string;
  totalAmount: number;
  status: "delivered" | "shipped" | "processing" | "cancelled" | "pending";
  image: string | null;
  createdAt: string;
}

export interface OrderStatusBreakdown {
  delivered: number;
  shipped: number;
  processing: number;
  cancelled: number;
}

export interface OrderStatusChartData {
  total: number;
  breakdown: OrderStatusBreakdown;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  image: string | null;
}

export interface BuyerAccountSummary {
  memberSince: string;
  accountType: string;
  totalSpent: number;
  savedAddressesCount: number;
}

export interface BuyerDashboardData {
  user: BuyerDashboardUser;
  metrics: BuyerDashboardMetrics;
  recentOrders: RecentOrder[];
  orderStatusChart: OrderStatusChartData;
  recommendedProducts: RecommendedProduct[];
  accountSummary: BuyerAccountSummary;
}

export interface GetBuyerDashboardResponse {
  success: boolean;
  data: BuyerDashboardData;
}