import type { StoreSchema } from '@/data-schema';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import type { IOrder, PaginationOptions, OrdersQueryResult, OrderStatus, PaymentStatus } from '../types';

const client = generateClient<StoreSchema>({
  authMode: 'userPool',
});

/**
 * Hook para manejar las queries de órdenes
 */
export const useOrderQueries = (
  storeId: string | undefined,
  options: PaginationOptions,
  currentPage: number,
  pageTokens: (string | null)[]
) => {
  const queryClient = useQueryClient();
  const { limit, sortDirection, sortField } = options;

  /**
   * Función para obtener órdenes de una página específica
   */
  const fetchOrdersPage = async (): Promise<OrdersQueryResult> => {
    if (!storeId) throw new Error('Store ID is required');

    const token = pageTokens[currentPage - 1];

    const { data, nextToken } = await client.models.Order.listOrderByStoreId(
      {
        storeId: storeId,
      },
      {
        limit,
        nextToken: token,
        // Incluir los items automáticamente
        selectionSet: ['items.*', 'items.order.*'],
      }
    );
    // Transformar la data para agrupar por orden y eliminar duplicados
    const ordersMap = new Map<string, any>();

    if (data) {
      data.forEach((orderGroup: any) => {
        if (orderGroup.items && Array.isArray(orderGroup.items)) {
          orderGroup.items.forEach((orderItem: any) => {
            if (orderItem.order) {
              const orderId = orderItem.order.id;

              if (!ordersMap.has(orderId)) {
                // Crear la orden base
                const order = {
                  ...orderItem.order,
                  items: {
                    items: [],
                  },
                };

                // Agregar el item actual
                order.items.items.push(orderItem);

                ordersMap.set(orderId, order);
              } else {
                // Agregar el item a la orden existente
                const existingOrder = ordersMap.get(orderId);
                existingOrder.items.items.push(orderItem);
              }
            }
          });
        }
      });
    }

    // Convertir el Map a array y ordenar
    const transformedOrders = Array.from(ordersMap.values());
    const sortedData = transformedOrders.sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a];
      const fieldB = b[sortField as keyof typeof b];

      if (fieldA === undefined || fieldA === null) return sortDirection === 'ASC' ? -1 : 1;
      if (fieldB === undefined || fieldB === null) return sortDirection === 'ASC' ? 1 : -1;

      if (fieldA < fieldB) return sortDirection === 'ASC' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'ASC' ? 1 : -1;
      return 0;
    });

    return {
      orders: sortedData as unknown as IOrder[],
      nextToken: nextToken as string | null,
    };
  };

  /**
   * Query principal para obtener órdenes
   */
  const {
    data,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['orders', storeId, limit, sortDirection, sortField, currentPage],
    queryFn: fetchOrdersPage,
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });

  /**
   * Función para buscar una orden específica por ID
   */
  const fetchOrderById = async (id: string): Promise<IOrder | null> => {
    if (!storeId) {
      console.error('Cannot get order: storeId not defined');
      return null;
    }

    const queryCache = queryClient.getQueryCache();
    const orderQueries = queryCache.findAll({ queryKey: ['orders', storeId] });

    for (const query of orderQueries) {
      const pageData = query.state.data as { orders: IOrder[] } | undefined;
      if (pageData?.orders) {
        const existingOrder = pageData.orders.find((o) => o.id === id);
        if (existingOrder) {
          return existingOrder;
        }
      }
    }

    try {
      const { data: order } = await client.models.Order.get(
        { id },
        {
          // Incluir los items automáticamente
          selectionSet: ['items.*'],
        }
      );

      if (order) {
        queryClient.setQueryData(['order', id], order);
        return order as unknown as IOrder;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      return null;
    }
  };

  /**
   * Función para buscar órdenes por número de orden
   */
  const fetchOrderByOrderNumber = async (orderNumber: string): Promise<IOrder | null> => {
    if (!storeId) {
      console.error('Cannot get order by order number: storeId not defined');
      return null;
    }

    try {
      const { data } = await client.models.Order.listOrderByOrderNumber(
        { orderNumber },
        {
          limit: 1,
          // Incluir los items automáticamente
          selectionSet: ['items.*'],
        }
      );

      if (data && data.length > 0) {
        return data[0] as unknown as IOrder;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching order by order number ${orderNumber}:`, error);
      return null;
    }
  };

  /**
   * Función para buscar órdenes por estado
   */
  const fetchOrdersByStatus = async (status: OrderStatus): Promise<IOrder[]> => {
    if (!storeId) {
      console.error('Cannot get orders by status: storeId not defined');
      return [];
    }

    try {
      const { data } = await client.models.Order.listOrderByStatus(
        { status },
        {
          limit: 100,
          // Incluir los items automáticamente
          selectionSet: ['items.*'],
        }
      );

      return data as unknown as IOrder[];
    } catch (error) {
      console.error(`Error fetching orders by status ${status}:`, error);
      return [];
    }
  };

  /**
   * Función para buscar órdenes por estado de pago
   */
  const fetchOrdersByPaymentStatus = async (paymentStatus: PaymentStatus): Promise<IOrder[]> => {
    if (!storeId) {
      console.error('Cannot get orders by payment status: storeId not defined');
      return [];
    }

    try {
      // Nota: Esto requeriría un índice secundario en paymentStatus
      // Por ahora, filtramos en el cliente
      const { data } = await client.models.Order.listOrderByStatus(
        { status: paymentStatus as OrderStatus },
        {
          limit: 100,
          // Incluir los items automáticamente
          selectionSet: ['items.*'],
        }
      );
      return data as unknown as IOrder[];
    } catch (error) {
      console.error(`Error fetching orders by payment status ${paymentStatus}:`, error);
      return [];
    }
  };

  /**
   * Función para buscar órdenes por email del cliente
   */
  const fetchOrdersByCustomerEmail = async (customerEmail: string): Promise<IOrder[]> => {
    if (!storeId) {
      console.error('Cannot get orders by customer email: storeId not defined');
      return [];
    }

    try {
      const { data } = await client.models.Order.listOrderByCustomerEmail(
        { customerEmail },
        {
          limit: 100,
          // Incluir los items automáticamente
          selectionSet: ['items.*'],
        }
      );

      return data as unknown as IOrder[];
    } catch (error) {
      console.error(`Error fetching orders by customer email ${customerEmail}:`, error);
      return [];
    }
  };

  return {
    data,
    isFetching,
    error: queryError,
    refetch,
    fetchOrderById,
    fetchOrderByOrderNumber,
    fetchOrdersByStatus,
    fetchOrdersByPaymentStatus,
    fetchOrdersByCustomerEmail,
  };
};
