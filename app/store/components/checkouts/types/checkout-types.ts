import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'token' | 'status' | 'totalAmount' | 'creationDate' | 'expiresAt';

export interface VisibleColumns {
  checkout: boolean;
  status: boolean;
  customer: boolean;
  total: boolean;
  expiresAt: boolean;
  actions: boolean;
}

export interface CheckoutListProps {
  storeId: string;
  checkouts: ICheckoutSession[];
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  currentPage: number;
  deleteMultipleCheckouts: (ids: string[]) => Promise<boolean>;
  refreshCheckouts: () => void;
  deleteCheckout: (id: string) => Promise<boolean>;
  completeCheckout: (id: string) => Promise<boolean>;
  expireCheckout: (id: string) => Promise<boolean>;
  cancelCheckout: (id: string) => Promise<boolean>;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  onViewDetails: (checkout: ICheckoutSession) => void;
}
