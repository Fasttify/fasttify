// Exportar el gestor principal
export { default as OrderManager } from './pages/OrderManager';

// Exportar componentes de lista
export { OrderList } from './components/listing/OrderList';
export { OrderTableDesktop } from './components/listing/OrderTableDesktop';
export { OrderCardMobile } from './components/listing/OrderCardMobile';
export { OrderFilters } from './components/listing/OrderFilters';
export { OrderPagination } from './components/listing/OrderPagination';
export { OrderEmptyState } from './components/listing/OrderEmptyState';

// Exportar componentes de detalles
export { OrderDetailsModal } from './components/details/OrderDetailsModal';
export { OrderHeader } from './components/details/OrderHeader';
export { OrderCustomerInfo } from './components/details/OrderCustomerInfo';
export { OrderItems } from './components/details/OrderItems';
export { OrderPricing } from './components/details/OrderPricing';
export { OrderTimeline } from './components/details/OrderTimeline';
export { OrderActions } from './components/details/OrderActions';
export { OrderSectionSkeleton, OrderItemsSkeleton } from './components/details/OrderSectionSkeleton';

// Exportar hooks
export { useOrderFilters } from './hooks/useOrderFilters';
export { useOrderSelection } from './hooks/useOrderSelection';
export { useOrderDetailsModal } from './hooks/useOrderDetailsModal';

// Exportar tipos
export type * from './types/order-types';

// Exportar utilidades
export * from './utils/order-utils';
