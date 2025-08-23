import { type StoreSchema } from '@/data-schema';

/**
 * Interfaz para representar una sesión de checkout
 */
export type ICheckoutSession = StoreSchema['CheckoutSession']['type'];

/**
 * Tipo para los datos necesarios al crear una sesión de checkout
 */
export type CheckoutSessionCreateInput = Omit<ICheckoutSession, 'id' | 'storeOwner'>;

/**
 * Tipo para los datos al actualizar una sesión de checkout
 */
export type CheckoutSessionUpdateInput = Partial<Omit<ICheckoutSession, 'id' | 'storeOwner'>> & {
  id: string;
};

/**
 * Opciones para filtrar sesiones de checkout
 */
export interface CheckoutSessionFilterOptions {
  status?: 'open' | 'completed' | 'expired' | 'cancelled';
  storeId?: string;
  token?: string;
  sessionId?: string;
  dateRange?: { start?: Date; end?: Date };
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  limit?: number;
  sortDirection?: 'ASC' | 'DESC';
  sortField?: keyof ICheckoutSession;
}

/**
 * Resultado del hook useCheckoutSessions
 */
export interface UseCheckoutSessionsResult {
  checkoutSessions: ICheckoutSession[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  resetPagination: () => void;
  createCheckoutSession: (sessionData: CheckoutSessionCreateInput) => Promise<ICheckoutSession | null>;
  updateCheckoutSession: (sessionData: CheckoutSessionUpdateInput) => Promise<ICheckoutSession | null>;
  deleteCheckoutSession: (id: string) => Promise<boolean>;
  deleteMultipleCheckoutSessions: (ids: string[]) => Promise<boolean>;
  completeCheckoutSession: (id: string) => Promise<ICheckoutSession | null>;
  expireCheckoutSession: (id: string) => Promise<ICheckoutSession | null>;
  cancelCheckoutSession: (id: string) => Promise<ICheckoutSession | null>;
  refreshCheckoutSessions: () => void;
  fetchCheckoutSession: (id: string) => Promise<ICheckoutSession | null>;
}

/**
 * Opciones de paginación y configuración
 */
export interface UseCheckoutSessionsOptions extends PaginationOptions {
  skipInitialFetch?: boolean;
  enabled?: boolean;
}

/**
 * Resultado de la consulta de sesiones de checkout
 */
export interface CheckoutSessionsQueryResult {
  checkoutSessions: ICheckoutSession[];
  nextToken: string | null;
}

/**
 * Estado de la sesión de checkout
 */
export type CheckoutSessionStatus = 'open' | 'completed' | 'expired' | 'cancelled';

/**
 * Información del cliente para el checkout
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
 * Snapshot de los items del carrito
 */
export interface CartItemSnapshot {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantTitle?: string;
  image?: string;
}
