export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã huỷ',
};

export interface OrderItem {
  id: number;
  productVariantId: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict?: string;
  shippingWard?: string;
  notes?: string;
  status: OrderStatus;
  statusName: string;
  paymentMethod: string;
  paymentMethodName: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  orderDate: string;
  items: OrderItem[];
}

export interface OrderListItem {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  statusName: string;
  paymentMethod: string;
  total: number;
  itemCount: number;
  orderDate: string;
}

export interface CreateOrderItem {
  productVariantId: number;
  quantity: number;
}

export interface CreateOrder {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict?: string;
  shippingWard?: string;
  notes?: string;
  items: CreateOrderItem[];
}

export interface OrderQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  status?: OrderStatus;
}
