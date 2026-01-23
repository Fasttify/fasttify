import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICheckoutSession, PaginationOptions, CheckoutSessionsQueryResult, CheckoutSessionStatus } from '../types';
import { storeClient } from '@/lib/clients/amplify-client';

/**
 * Hook para manejar las queries de sesiones de checkout
 */
export const useCheckoutSessionQueries = (
  storeId: string | undefined,
  options: PaginationOptions,
  currentPage: number,
  pageTokens: (string | null)[]
) => {
  const queryClient = useQueryClient();
  const { limit, sortDirection, sortField } = options;

  /**
   * Función para obtener sesiones de checkout de una página específica
   */
  const fetchCheckoutSessionsPage = async (): Promise<CheckoutSessionsQueryResult> => {
    if (!storeId) throw new Error('Store ID is required');

    const token = pageTokens[currentPage - 1];

    const { data, nextToken } = await storeClient.models.CheckoutSession.listCheckoutSessionByStoreId(
      {
        storeId: storeId,
      },
      {
        limit,
        nextToken: token,
      }
    );

    const sortedData = [...(data || [])].sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a];
      const fieldB = b[sortField as keyof typeof b];

      if (fieldA === undefined || fieldA === null) return sortDirection === 'ASC' ? -1 : 1;
      if (fieldB === undefined || fieldB === null) return sortDirection === 'ASC' ? 1 : -1;

      if (fieldA < fieldB) return sortDirection === 'ASC' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'ASC' ? 1 : -1;
      return 0;
    });

    return {
      checkoutSessions: sortedData as ICheckoutSession[],
      nextToken: nextToken as string | null,
    };
  };

  /**
   * Query principal para obtener sesiones de checkout
   */
  const {
    data,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['checkoutSessions', storeId, limit, sortDirection, sortField, currentPage],
    queryFn: fetchCheckoutSessionsPage,
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });

  /**
   * Función para buscar una sesión de checkout específica por ID
   */
  const fetchCheckoutSessionById = async (id: string): Promise<ICheckoutSession | null> => {
    if (!storeId) {
      console.error('Cannot get checkout session: storeId not defined');
      return null;
    }

    const queryCache = queryClient.getQueryCache();
    const checkoutSessionQueries = queryCache.findAll({ queryKey: ['checkoutSessions', storeId] });

    for (const query of checkoutSessionQueries) {
      const pageData = query.state.data as { checkoutSessions: ICheckoutSession[] } | undefined;
      if (pageData?.checkoutSessions) {
        const existingSession = pageData.checkoutSessions.find((s) => s.id === id);
        if (existingSession) {
          return existingSession;
        }
      }
    }

    try {
      const { data: checkoutSession } = await storeClient.models.CheckoutSession.get({ id });

      if (checkoutSession) {
        queryClient.setQueryData(['checkoutSession', id], checkoutSession);
        return checkoutSession as ICheckoutSession;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching checkout session ${id}:`, error);
      return null;
    }
  };

  /**
   * Función para buscar sesiones de checkout por token
   */
  const fetchCheckoutSessionByToken = async (token: string): Promise<ICheckoutSession | null> => {
    if (!storeId) {
      console.error('Cannot get checkout session by token: storeId not defined');
      return null;
    }

    try {
      const { data } = await storeClient.models.CheckoutSession.listCheckoutSessionByToken({ token }, { limit: 1 });

      if (data && data.length > 0) {
        return data[0] as ICheckoutSession;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching checkout session by token ${token}:`, error);
      return null;
    }
  };

  /**
   * Función para buscar sesiones de checkout por estado
   */
  const fetchCheckoutSessionsByStatus = async (status: CheckoutSessionStatus): Promise<ICheckoutSession[]> => {
    if (!storeId) {
      console.error('Cannot get checkout sessions by status: storeId not defined');
      return [];
    }

    try {
      const { data } = await storeClient.models.CheckoutSession.listCheckoutSessionByStatus({ status }, { limit: 100 });

      return data as ICheckoutSession[];
    } catch (error) {
      console.error(`Error fetching checkout sessions by status ${status}:`, error);
      return [];
    }
  };

  return {
    data,
    isFetching,
    error: queryError,
    refetch,
    fetchCheckoutSessionById,
    fetchCheckoutSessionByToken,
    fetchCheckoutSessionsByStatus,
  };
};
