import type { IOrder } from '@/app/store/hooks/data/useOrders';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'orderNumber' | 'status' | 'paymentStatus' | 'totalAmount' | 'creationDate' | 'customerEmail';

export interface VisibleColumns {
  order: boolean;
  status: boolean;
  paymentStatus: boolean;
  customer: boolean;
  total: boolean;
  creationDate: boolean;
  actions: boolean;
}

export interface OrderListProps {
  storeId: string;
  orders: IOrder[];
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  currentPage: number;
  deleteMultipleOrders: (ids: string[]) => Promise<boolean>;
  refreshOrders: () => void;
  deleteOrder: (id: string) => Promise<boolean>;
  updateOrderStatus: (id: string, status: string) => Promise<boolean>;
  updatePaymentStatus: (id: string, paymentStatus: string) => Promise<boolean>;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  onViewDetails: (order: IOrder) => void;
}
