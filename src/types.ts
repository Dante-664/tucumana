export type OrderStatus = 'en_camino' | 'en_horno' | 'pendiente_cocina' | 'entregado';
export type PaymentStatus = 'PAGADO' | 'COBRAR_EFECTIVO' | 'PENDIENTE';
export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Mercado Pago' | 'Tarjeta';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitLabel?: string; // e.g. '1d', '½d', '1x', '2d'
  unitPrice: number;
  category: 'saladas' | 'arabes' | 'dulces' | 'bebidas';
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  isDelivery: boolean;
  address?: string;
  motoAssignee?: string;
  pickupTime?: string;
  deliveryEstimatedTime?: string;
  items: OrderItem[];
  itemsSummary: string[];
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDetail?: string; // e.g. 'Transferencia MP comprobada' | 'Prepara cambio con $30.000' | 'Cobro en mostrador'
  status: OrderStatus;
  isWhatsApp: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  concept: string;
  amount: number;
  method: 'Efectivo' | 'Transferencia' | 'Mercado Pago';
  time: string;
  category: string;
}

export interface BatchTanda {
  id: string;
  number: number;
  units: number;
  time: string;
  cook: string;
  oven: string;
  status: 'Listo' | 'Despachado' | 'Recién Salida';
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  description: string;
  category: 'saladas' | 'arabes' | 'dulces' | 'bebidas';
  price: number;
  tag?: string;
  badge?: string;
  image?: string;
}
