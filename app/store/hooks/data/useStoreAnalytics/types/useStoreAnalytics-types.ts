import { type StoreAnalyticsType } from '@/lib/amplify-client';

/**
 * Tipo principal para las analíticas de tienda
 */
export type StoreAnalytics = StoreAnalyticsType;

/**
 * Período de tiempo para las analíticas
 */
export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Opciones de filtro para las analíticas
 */
export interface AnalyticsFilterOptions {
  /** Período específico */
  period?: AnalyticsPeriod;
  /** Fecha de inicio (formato: YYYY-MM-DD) */
  startDate?: string;
  /** Fecha de fin (formato: YYYY-MM-DD) */
  endDate?: string;
  /** Fecha específica (formato: YYYY-MM-DD) */
  date?: string;
}

/**
 * Opciones de configuración para el hook
 */
export interface UseStoreAnalyticsOptions {
  /** Filtros a aplicar */
  filterOptions?: AnalyticsFilterOptions;
  /** Desactivar la consulta inicial */
  enabled?: boolean;
  /** Intervalo de actualización en milisegundos */
  refetchInterval?: number;
  /** Tiempo de stale en milisegundos */
  staleTime?: number;
}

/**
 * Resultado del hook useStoreAnalytics
 */
export interface UseStoreAnalyticsResult {
  /** Datos de analíticas */
  analytics: StoreAnalytics[];
  /** Analítica de un día específico */
  dailyAnalytics: StoreAnalytics | null;
  /** Estado de carga */
  loading: boolean;
  /** Error si existe */
  error: Error | null;
  /** Función para refrescar datos */
  refetch: () => void;
  /** Función para obtener analíticas por rango de fechas */
  getAnalyticsByDateRange: (startDate: string, endDate: string) => Promise<StoreAnalytics[]>;
  /** Función para obtener analíticas por período */
  getAnalyticsByPeriod: (period: AnalyticsPeriod, limit?: number) => Promise<StoreAnalytics[]>;
}

/**
 * Resultado de la query de analíticas
 */
export interface AnalyticsQueryResult {
  analytics: StoreAnalytics[];
  nextToken?: string | null;
}

/**
 * Parámetros para queries de analíticas
 */
export interface AnalyticsQueryParams {
  storeId: string;
  period?: AnalyticsPeriod;
  date?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  nextToken?: string | null;
}

/**
 * Métricas resumidas de analíticas
 */
export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  period: AnalyticsPeriod;
  dateRange: {
    start: string;
    end: string;
  };
}
