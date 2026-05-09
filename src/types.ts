export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'COD' | 'Manual';
export type PaymentGateway = 'bKash' | 'Nagad' | 'Rocket' | 'None';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  stock: number;
  isHot?: boolean;
  isTopSale?: boolean;
  createdAt: any;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Admin {
  id: string;
  email: string;
  role: 'super' | 'admin';
  addedBy?: string;
  addedAt: any;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  productId?: string; // If null/undefined, it applies to all products
  isActive: boolean;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: any;
}

export interface Order {
  id: string;
  orderID: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  deliveryCharge: number;
  region: string;
  paymentMethod: PaymentMethod;
  paymentGateway?: PaymentGateway;
  transactionID?: string;
  screenshotURL?: string;
  status: OrderStatus;
  createdAt: any;
  updatedAt: any;
}
