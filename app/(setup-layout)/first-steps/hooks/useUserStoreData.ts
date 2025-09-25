import type { FullSchema, StoreSchema } from '@/data-schema';
import outputs from '@/amplify_outputs.json';
import { useAuth } from '@/context/hooks/useAuth';
import { useCacheInvalidation } from '@/hooks/cache/useCacheInvalidation';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { useState } from 'react';

Amplify.configure(outputs);

const client = generateClient<FullSchema>({
  authMode: 'userPool',
});

export type UserStore = StoreSchema['UserStore']['type'];

export type PaymentGatewayType = 'mercadoPago' | 'wompi';

export interface PaymentGatewayConfig {
  publicKey: string;
  privateKey: string;
  isActive: boolean;
  createdAt: string;
}

export interface StoreInitializationResult {
  success: boolean;
  message: string;
  collections?: string[];
  menus?: string[];
}

export type NavigationMenu = StoreSchema['NavigationMenu']['type'];

export interface MenuItem {
  label: string;
  url: string;
  type: 'internal' | 'external' | 'page' | 'collection' | 'product';
  isVisible: boolean;
  target?: '_blank' | '_self';
  sortOrder: number;
}

export const useUserStoreData = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();
  const { invalidateAllStoreCache, invalidateNavigationCache } = useCacheInvalidation();

  /**
   * Función auxiliar que ejecuta una operación y gestiona loading y error.
   */
  const performOperation = async <T>(operation: () => Promise<{ data: T; errors?: any[] }>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      if (result.errors && result.errors.length > 0) {
        setError(result.errors);
        return null;
      }
      return result.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene la información de pasarelas de pago configuradas
   * para una tienda específica sin traer datos sensibles.
   * @param storeId - ID único de la tienda
   * @returns Array de pasarelas configuradas
   */
  const getStorePaymentInfo = async (
    storeId: string
  ): Promise<{
    configuredGateways: PaymentGatewayType[];
  }> => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.userId) {
        setError('User not authenticated');
        return { configuredGateways: [] };
      }

      const configuredGateways: PaymentGatewayType[] = [];

      // Consultar StorePaymentConfig para Wompi
      const wompiConfigs = await performOperation(() =>
        client.models.StorePaymentConfig.listStorePaymentConfigByStoreId(
          {
            storeId: storeId,
          },
          {
            filter: {
              gatewayType: { eq: 'wompi' },
              isActive: { eq: true }, // Solo configs activas
            },
            selectionSet: ['isActive'], // Solo necesitamos confirmar existencia
          }
        )
      );

      // Consultar StorePaymentConfig para MercadoPago
      const mercadoPagoConfigs = await performOperation(() =>
        client.models.StorePaymentConfig.listStorePaymentConfigByStoreId(
          {
            storeId: storeId,
          },
          {
            filter: {
              gatewayType: { eq: 'mercadoPago' },
              isActive: { eq: true }, // Solo configs activas
            },
            selectionSet: ['isActive'], // Solo necesitamos confirmar existencia
          }
        )
      );

      if (wompiConfigs && wompiConfigs.length > 0) {
        configuredGateways.push('wompi');
      }

      if (mercadoPagoConfigs && mercadoPagoConfigs.length > 0) {
        configuredGateways.push('mercadoPago');
      }

      return {
        configuredGateways,
      };
    } catch (err) {
      setError(err);
      return { configuredGateways: [] };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Configura una pasarela de pago para una tienda específica.
   */
  const configurePaymentGateway = async (
    storeId: string,
    gateway: PaymentGatewayType,
    config: PaymentGatewayConfig
  ): Promise<boolean> => {
    if (!storeId || !user?.userId) {
      setError('Store ID or User ID not provided');
      return false;
    }

    try {
      const mutationInput = {
        storeId,
        gatewayType: gateway,
        publicKey: config.publicKey,
        privateKey: config.privateKey,
        isActive: config.isActive,
      };

      const result = await performOperation(() =>
        client.mutations.processStorePaymentConfig({
          action: 'update',
          input: mutationInput,
        })
      );

      return result?.success === true;
    } catch (err) {
      setError(err);
      return false;
    }
  };

  /**
   * Crea una tienda (UserStore) en la base de datos.
   */
  const createUserStore = async (
    storeInput: Omit<StoreSchema['UserStore']['type'], 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const result = await performOperation(() => client.models.UserStore.create(storeInput));
    if (result && storeInput.storeId) {
      await invalidateAllStoreCache(storeInput.storeId);
      await invalidateNavigationCache(storeInput.storeId);
    }
    return result;
  };

  /**
   * Actualiza los datos de una tienda.
   */
  const updateUserStore = async (
    storeInput: Omit<Partial<UserStore>, 'id' | 'createdAt' | 'updatedAt'> & { storeId: string }
  ) => {
    const result = await performOperation(() => client.models.UserStore.update(storeInput));
    if (result && storeInput.storeId) {
      await invalidateAllStoreCache(storeInput.storeId);
      await invalidateNavigationCache(storeInput.storeId);
    }
    return result;
  };

  /**
   * Elimina una tienda a partir de su 'storeId'.
   */
  const deleteUserStore = async (storeId: string) => {
    const result = await performOperation(() => client.models.UserStore.delete({ storeId }));
    if (result && storeId) {
      await invalidateAllStoreCache(storeId);
      await invalidateNavigationCache(storeId);
    }
    return result;
  };

  /**
   * Inicializa los datos por defecto para una nueva tienda.
   * Crea colecciones base y menús de navegación dinámicos.
   */
  const initializeStoreTemplate = async (storeId: string, domain: string) => {
    if (!storeId || !domain) {
      setError('Store ID and domain are required');
      return null;
    }

    const result = await performOperation(() =>
      client.mutations.initializeStoreTemplate({
        storeId,
        domain,
      })
    );
    if (result && storeId) {
      await invalidateAllStoreCache(storeId);
      await invalidateNavigationCache(storeId);
    }
    return result;
  };

  /**
   * Obtiene los menús de navegación de una tienda específica.
   */
  const getStoreMenus = async (storeId: string, domain: string) => {
    if (!storeId || !domain) {
      setError('Store ID and domain are required');
      return null;
    }

    return performOperation(() =>
      client.models.NavigationMenu.listNavigationMenuByStoreId(
        {
          storeId,
        },
        {
          selectionSet: ['id', 'name', 'handle', 'isMain', 'isActive', 'domain', 'menuData'],
        }
      )
    );
  };

  /**
   * Función completa para crear una tienda con todos sus datos iniciales.
   * Crea la tienda y luego inicializa sus colecciones y menús automáticamente.
   */
  const createStoreWithTemplate = async (
    storeInput: Omit<
      StoreSchema['UserStore']['type'],
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'products'
      | 'collections'
      | 'carts'
      | 'cartItems'
      | 'orders'
      | 'orderItems'
      | 'pages'
      | 'navigationMenus'
      | 'storePaymentConfig'
      | 'storeCustomDomain'
      | 'userThemes'
      | 'checkoutSessions'
      | 'notifications'
      | 'storeAnalytics'
    >
  ) => {
    try {
      setLoading(true);
      setError(null);

      const storeResult = await performOperation(() => client.models.UserStore.create(storeInput));

      if (!storeResult) {
        throw new Error('Failed to create store');
      }

      const domain = storeInput.defaultDomain || `${storeInput.storeName}.fasttify.com`;

      const templateResult = await initializeStoreTemplate(storeInput.storeId, domain);

      if (storeInput.storeId) {
        await invalidateAllStoreCache(storeInput.storeId);
        await invalidateNavigationCache(storeInput.storeId);
      }

      return {
        store: storeResult,
        template: templateResult,
        success: true,
      };
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createUserStore,
    updateUserStore,
    deleteUserStore,
    getStorePaymentInfo,
    configurePaymentGateway,
    initializeStoreTemplate,
    getStoreMenus,
    createStoreWithTemplate,
  };
};
