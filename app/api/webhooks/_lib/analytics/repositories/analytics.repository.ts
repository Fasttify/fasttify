import { cookiesClient } from '@/utils/server/AmplifyServer';

export interface StoreAnalyticsRecord {
  id: string;
  date: string;
  newCustomers?: number | null;
  returningCustomers?: number | null;
  totalCustomers?: number | null;
  lowStockAlerts?: number | null;
  outOfStockProducts?: number | null;
}

/**
 * Repositorio de acceso a datos para `StoreAnalytics`.
 *
 * Responsabilidades:
 * - Obtener o crear el registro de analytics del día (idempotente por fecha).
 * - Actualizar parcialmente campos, convirtiendo estructuras a JSON donde aplica.
 */
export class AnalyticsRepository {
  /**
   * Devuelve el registro de analytics para `storeId` y `date`.
   * Si no existe, lo crea con valores iniciales.
   */
  async getOrCreateAnalytics(storeId: string, date: string): Promise<StoreAnalyticsRecord> {
    // Buscar paginando por storeId hasta encontrar la fecha del día
    let nextToken: string | undefined = undefined;
    do {
      const response: any = await cookiesClient.models.StoreAnalytics.analyticsByStore(
        { storeId },
        nextToken ? { nextToken } : undefined
      );
      const found = response.data?.find((a: StoreAnalyticsRecord) => a.date === date);
      if (found) return found as StoreAnalyticsRecord;
      nextToken = response?.nextToken;
    } while (nextToken);

    const store = await cookiesClient.models.UserStore.get({ storeId });
    const storeOwner = store?.data?.userId;
    if (!storeOwner) throw new Error(`Store owner not found for store ${storeId}`);

    try {
      const createResponse = await cookiesClient.models.StoreAnalytics.create({
        storeId,
        storeOwner,
        date,
        period: 'daily',
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        newCustomers: 0,
        returningCustomers: 0,
        totalCustomers: 0,
        totalProductsSold: 0,
        uniqueProductsSold: 0,
        lowStockAlerts: 0,
        outOfStockProducts: 0,
        storeViews: 0,
        conversionRate: 0,
        totalDiscounts: 0,
        discountPercentage: 0,
        sessionsByCountry: null,
        sessionsByDevice: null,
        sessionsByBrowser: null,
        sessionsByReferrer: null,
        uniqueVisitors: 0,
        totalSessions: 0,
      });
      if (!createResponse.data) {
        throw new Error(`Failed to create analytics record: ${JSON.stringify(createResponse.errors)}`);
      }
      return createResponse.data as StoreAnalyticsRecord;
    } catch (error: any) {
      // Si otro proceso lo creó en paralelo, buscar nuevamente
      const conflictHints = ['Conflict', 'already exists', 'ConditionalCheckFailed'];
      const message = typeof error?.message === 'string' ? error.message : String(error);
      if (conflictHints.some((h) => message.includes(h))) {
        // Buscar nuevamente por si otro proceso lo creó
        const retryResponse = await cookiesClient.models.StoreAnalytics.analyticsByStore({ storeId });
        const retryFound = retryResponse.data?.find((a: StoreAnalyticsRecord) => a.date === date);
        if (retryFound) return retryFound as StoreAnalyticsRecord;
      }
      throw error;
    }
  }

  /**
   * Actualiza el registro de analytics. Convierte objetos a JSON string
   * en los campos que se almacenan como texto en la base de datos.
   */
  async updateAnalytics(analyticsId: string, updates: Record<string, unknown>) {
    const processedUpdates: Record<string, unknown> = { ...updates };
    const jsonFields = [
      'sessionsByCountry',
      'sessionsByDevice',
      'sessionsByBrowser',
      'sessionsByReferrer',
      'countries',
      'conversionRateByCountry',
      'uniqueVisitorsByCountry',
    ];
    for (const field of jsonFields) {
      if (processedUpdates[field] !== undefined) {
        if (processedUpdates[field] === null) {
          processedUpdates[field] = null;
        } else if (typeof processedUpdates[field] === 'object') {
          processedUpdates[field] = JSON.stringify(processedUpdates[field]);
        }
      }
    }
    return cookiesClient.models.StoreAnalytics.update({ id: analyticsId, ...processedUpdates });
  }
}

export const analyticsRepository = new AnalyticsRepository();
