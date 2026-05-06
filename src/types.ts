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

export interface Order {
  id: string;
  orderID: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentGateway?: PaymentGateway;
  transactionID?: string;
  screenshotURL?: string;
  status: OrderStatus;
  createdAt: any;
  updatedAt: any;
}
