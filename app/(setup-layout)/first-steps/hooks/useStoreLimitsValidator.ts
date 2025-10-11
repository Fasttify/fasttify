import { useState, useCallback } from 'react';
import { post } from 'aws-amplify/api';
import useAuthStore from '@/context/core/userStore';

/**
 * Hook personalizado para validar límites de creación de tiendas.
 * Realiza una petición a la función Lambda para verificar si el usuario puede crear más tiendas.
 *
 * @returns {Object} Un objeto con las siguientes propiedades:
 * - validateLimits: Función para validar los límites de tiendas
 * - isValidating: Estado que indica si se está realizando la validación
 * - canCreateStore: Estado que indica si puede crear más tiendas
 * - storeInfo: Información sobre el estado actual de las tiendas
 */
export function useStoreLimitsValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [canCreateStore, setCanCreateStore] = useState(true);
  const [storeInfo, setStoreInfo] = useState<{
    currentCount: number;
    limit: number;
    plan: string;
    message?: string;
  } | null>(null);
  const { user } = useAuthStore();
  /**
   * Verifica si el usuario puede crear más tiendas según su plan.
   * @returns {Promise<boolean>} - true si puede crear tienda, false si ha alcanzado el límite
   */
  const validateLimits = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);

    try {
      const response = await post({
        apiName: 'StoreLimitsApi',
        path: 'validate-limits',
        options: {
          body: JSON.stringify({
            userId: user?.userId,
          }),
          retryStrategy: {
            strategy: 'jittered-exponential-backoff',
          },
        },
      });

      const { body } = await response.response;
      const result = (await body.json()) as {
        success: boolean;
        canCreateStore: boolean;
        currentCount: number;
        limit: number;
        plan: string;
        message?: string;
      };

      setCanCreateStore(result.canCreateStore);
      setStoreInfo({
        currentCount: result.currentCount,
        limit: result.limit,
        plan: result.plan,
        message: result.message,
      });

      return result.canCreateStore;
    } catch (error) {
      console.error('Error validating store limits:', error);
      // En caso de error, NO permitir la creación
      // pero mostrar un mensaje de advertencia
      setCanCreateStore(true);
      setStoreInfo({
        currentCount: 0,
        limit: 0,
        plan: 'unknown',
        message: 'Error validando límites, procediendo con precaución',
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [user?.userId]);

  return { validateLimits, isValidating, canCreateStore, storeInfo };
}
