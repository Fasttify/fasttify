import { useAuth } from '@/context/hooks/useAuth';
import { useCacheInvalidation } from '@/hooks/cache/useCacheInvalidation';
import { useState } from 'react';
import {
  client,
  type UserStore,
  type NavigationMenu,
  type PaymentGatewayType,
  type PaymentGatewayConfig,
  type StoreInitializationResult,
  type CreateUserStoreInput,
} from '@/lib/amplify-client';

// Re-exportar tipos para compatibilidad
export type { PaymentGatewayType, PaymentGatewayConfig, StoreInitializationResult } from '@/lib/amplify-client';

export const useUserStoreData = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();
  const { invalidateAllStoreCache, invalidateNavigationCache } = useCacheInvalidation();

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

      const wompiConfigs = await performOperation(() =>
        client.models.StorePaymentConfig.listStorePaymentConfigByStoreId(
          { storeId },
          { filter: { gatewayType: { eq: 'wompi' }, isActive: { eq: true } }, selectionSet: ['isActive'] }
        )
      );

      const mercadoPagoConfigs = await performOperation(() =>
        client.models.StorePaymentConfig.listStorePaymentConfigByStoreId(
          { storeId },
          { filter: { gatewayType: { eq: 'mercadoPago' }, isActive: { eq: true } }, selectionSet: ['isActive'] }
        )
      );

      if (wompiConfigs && wompiConfigs.length > 0) {
        configuredGateways.push('wompi');
      }

      if (mercadoPagoConfigs && mercadoPagoConfigs.length > 0) {
        configuredGateways.push('mercadoPago');
      }

      return { configuredGateways };
    } catch (err) {
      setError(err);
      return { configuredGateways: [] };
    } finally {
      setLoading(false);
    }
  };

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

  const createUserStore = async (storeInput: CreateUserStoreInput): Promise<UserStore | null> => {
    const result = await performOperation(() => client.models.UserStore.create(storeInput));
    if (result && storeInput.storeId) {
      await invalidateAllStoreCache(storeInput.storeId);
      await invalidateNavigationCache(storeInput.storeId);
    }
    return result;
  };

  const updateUserStore = async (
    storeInput: Omit<Partial<UserStore>, 'id' | 'createdAt' | 'updatedAt'> & { storeId: string }
  ): Promise<UserStore | null> => {
    const result = await performOperation(() => client.models.UserStore.update(storeInput));
    if (result && storeInput.storeId) {
      await invalidateAllStoreCache(storeInput.storeId);
      await invalidateNavigationCache(storeInput.storeId);
    }
    return result;
  };

  const deleteUserStore = async (storeId: string): Promise<UserStore | null> => {
    const result = await performOperation(() => client.models.UserStore.delete({ storeId }));
    if (result && storeId) {
      await invalidateAllStoreCache(storeId);
      await invalidateNavigationCache(storeId);
    }
    return result;
  };

  const initializeStoreTemplate = async (
    storeId: string,
    domain: string
  ): Promise<StoreInitializationResult | null> => {
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

    return result as StoreInitializationResult | null;
  };

  const getStoreMenus = async (storeId: string, domain: string): Promise<NavigationMenu[] | null> => {
    if (!storeId || !domain) {
      setError('Store ID and domain are required');
      return null;
    }

    return performOperation(() =>
      client.models.NavigationMenu.listNavigationMenuByStoreId({
        storeId,
      })
    );
  };

  type CreateStoreWithTemplateResult = {
    store: UserStore;
    template: StoreInitializationResult | null;
    success: boolean;
  };

  const createStoreWithTemplate = async (
    storeInput: CreateUserStoreInput
  ): Promise<CreateStoreWithTemplateResult | null> => {
    try {
      setLoading(true);
      setError(null);

      const storeResult = await createUserStore(storeInput);

      if (!storeResult) {
        throw new Error('Failed to create store');
      }

      const domain = storeInput.defaultDomain || `${storeInput.storeName}.fasttify.com`;
      const templateResult = await initializeStoreTemplate(storeInput.storeId, domain);

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
