import { type StoreSchema } from '@/data-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import type { ICheckoutSession, CheckoutSessionCreateInput, CheckoutSessionUpdateInput } from '../types';
import { useCheckoutSessionCacheUtils } from '../utils/checkoutSessionCacheUtils';

const client = generateClient<StoreSchema>({
  authMode: 'userPool',
});

/**
 * Hook para manejar todas las mutaciones de sesiones de checkout
 */
export const useCheckoutSessionMutations = (storeId: string | undefined) => {
  const queryClient = useQueryClient();
  const cacheUtils = useCheckoutSessionCacheUtils(storeId);

  /**
   * Mutación para crear una sesión de checkout
   */
  const createCheckoutSessionMutation = useMutation({
    mutationFn: async (sessionData: CheckoutSessionCreateInput) => {
      const { username } = await getCurrentUser();
      const dataToSend = {
        ...sessionData,
        storeOwner: username,
        expiresAt: sessionData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas por defecto
        status: sessionData.status || 'open',
        currency: sessionData.currency || 'COP',
        subtotal: sessionData.subtotal || 0,
        shippingCost: sessionData.shippingCost || 0,
        taxAmount: sessionData.taxAmount || 0,
        totalAmount: sessionData.totalAmount || 0,
      };

      const { data } = await client.models.CheckoutSession.create(dataToSend);
      return data as ICheckoutSession;
    },
    onSuccess: async (newSession) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateCheckoutSessionInCache(newSession);
    },
  });

  /**
   * Mutación para actualizar una sesión de checkout
   */
  const updateCheckoutSessionMutation = useMutation({
    mutationFn: async (sessionData: CheckoutSessionUpdateInput) => {
      const dataToSend = {
        ...sessionData,
        // Recalcular total si se actualizan los montos
        totalAmount:
          sessionData.subtotal !== undefined ||
          sessionData.shippingCost !== undefined ||
          sessionData.taxAmount !== undefined
            ? (sessionData.subtotal || 0) + (sessionData.shippingCost || 0) + (sessionData.taxAmount || 0)
            : undefined,
      };

      const { data } = await client.models.CheckoutSession.update(dataToSend);
      return data as ICheckoutSession;
    },
    onSuccess: async (updatedSession) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateCheckoutSessionInCache(updatedSession);
    },
  });

  /**
   * Mutación para eliminar una sesión de checkout
   */
  const deleteCheckoutSessionMutation = useMutation({
    mutationFn: async ({ id, storeOwner }: { id: string; storeOwner: string }) => {
      if (!id) {
        throw new Error('ID is required for deletion');
      }
      await client.models.CheckoutSession.delete({ id });
      return id;
    },
    onSuccess: async (deletedId) => {
      // Remover del caché optimísticamente
      cacheUtils.removeCheckoutSessionsFromCache([deletedId]);
    },
  });

  /**
   * Mutación para eliminar múltiples sesiones de checkout
   */
  const deleteMultipleCheckoutSessionsMutation = useMutation({
    mutationFn: async ({ ids, storeOwner }: { ids: string[]; storeOwner: string }) => {
      await Promise.all(ids.map((id) => client.models.CheckoutSession.delete({ id })));
      return ids;
    },
    onSuccess: async (deletedIds) => {
      // Remover del caché optimísticamente
      cacheUtils.removeCheckoutSessionsFromCache(deletedIds);
    },
  });

  /**
   * Mutación para marcar una sesión como completada
   */
  const completeCheckoutSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.models.CheckoutSession.update({
        id,
        status: 'completed',
      });
      return data as ICheckoutSession;
    },
    onSuccess: async (updatedSession) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateCheckoutSessionInCache(updatedSession);
    },
  });

  /**
   * Mutación para marcar una sesión como expirada
   */
  const expireCheckoutSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.models.CheckoutSession.update({
        id,
        status: 'expired',
        expiresAt: new Date().toISOString(),
      });
      return data as ICheckoutSession;
    },
    onSuccess: async (updatedSession) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateCheckoutSessionInCache(updatedSession);
    },
  });

  /**
   * Mutación para cancelar una sesión
   */
  const cancelCheckoutSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.models.CheckoutSession.update({
        id,
        status: 'cancelled',
      });
      return data as ICheckoutSession;
    },
    onSuccess: async (updatedSession) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateCheckoutSessionInCache(updatedSession);
    },
  });

  return {
    createCheckoutSessionMutation,
    updateCheckoutSessionMutation,
    deleteCheckoutSessionMutation,
    deleteMultipleCheckoutSessionsMutation,
    completeCheckoutSessionMutation,
    expireCheckoutSessionMutation,
    cancelCheckoutSessionMutation,
  };
};
