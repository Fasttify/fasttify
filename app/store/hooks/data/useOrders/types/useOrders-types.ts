import { type StoreSchema } from '@/data-schema';

/**
 * Interfaz para representar una orden
 */
export type IOrder = StoreSchema['Order']['type'];

/**
 * Interfaz para representar un item de orden
 */
export type IOrderItem = StoreSchema['OrderItem']['type'];

/**
 * Tipo para los datos necesarios al crear una orden
 */
export type OrderCreateInput = Omit<IOrder, 'id' | 'storeOwner'>;

/**
 * Tipo para los datos al actualizar una orden
 */
export type OrderUpdateInput = Partial<Omit<IOrder, 'id' | 'storeOwner'>> & {
  id: string;
};

/**
 * Opciones para filtrar órdenes
 */
export interface OrderFilterOptions {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  storeId?: string;
  orderNumber?: string;
  customerId?: string;
  customerEmail?: string;
  dateRange?: { start?: Date; end?: Date };
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  limit?: number;
  sortDirection?: 'ASC' | 'DESC';
  sortField?: keyof IOrder;
}

/**
 * Resultado del hook useOrders
 */
export interface UseOrdersResult {
  orders: IOrder[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  resetPagination: () => void;
  createOrder: (orderData: OrderCreateInput) => Promise<IOrder | null>;
  updateOrder: (orderData: OrderUpdateInput) => Promise<IOrder | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  deleteMultipleOrders: (ids: string[]) => Promise<boolean>;
  updateOrderStatus: (
    id: string,
    status: OrderStatus,
    previousStatus?: OrderStatus,
    updateNotes?: string
  ) => Promise<IOrder | null>;
  updatePaymentStatus: (
    id: string,
    paymentStatus: PaymentStatus,
    previousPaymentStatus?: PaymentStatus,
    updateNotes?: string
  ) => Promise<IOrder | null>;
  refreshOrders: () => void;
  fetchOrder: (id: string) => Promise<IOrder | null>;
}

/**
 * Opciones de paginación y configuración
 */
export interface UseOrdersOptions extends PaginationOptions {
  skipInitialFetch?: boolean;
  enabled?: boolean;
}

/**
 * Resultado de la consulta de órdenes
 */
export interface OrdersQueryResult {
  orders: IOrder[];
  nextToken: string | null;
}

/**
 * Estado de la orden
 */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Estado del pago
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Tipo de cliente
 */
export type CustomerType = 'registered' | 'guest';

/**
 * Información del cliente para la orden
 */
export interface CustomerInfo {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
}

/**
 * Dirección de envío o facturación
 */
export interface Address {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

/**
 * Snapshot del producto en la orden
 */
export interface ProductSnapshot {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  variantId?: string;
  variantTitle?: string;
}
