import { useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { FullSchema } from '@/amplify/data/resource';

const client = generateClient<FullSchema>({
  authMode: 'userPool',
});

interface OnboardingProgressParams {
  storeId: string;
  taskId: number;
  taskTitle: string;
  action: 'completed' | 'uncompleted';
  userId?: string;
}

/**
 * Hook personalizado para rastrear el progreso del onboarding
 * Invoca automáticamente la función lambda cada vez que se completa/descompleta una tarea
 */
export function useOnboardingProgress() {
  /**
   * Rastrea el progreso de una tarea del onboarding
   */
  const trackTaskProgress = useCallback(async (params: OnboardingProgressParams) => {
    try {
      const { storeId, taskId, taskTitle, action, userId } = params;

      // Validar que storeId no esté vacío
      if (!storeId || storeId.trim() === '') {
        throw new Error('storeId is required and cannot be empty');
      }

      const mutationParams = {
        storeId,
        taskId,
        taskTitle,
        action,
        userId,
        timestamp: new Date().toISOString(),
      };

      console.log('Calling trackOnboardingProgress with params:', mutationParams);

      // Invocar la función lambda automáticamente
      const result = await client.mutations.trackOnboardingProgress(mutationParams);

      if (result.data) {
        return { success: true, data: result.data };
      } else {
        console.error('Failed to track onboarding progress:', result.errors);
        return { success: false, errors: result.errors };
      }
    } catch (error) {
      console.error('Error tracking onboarding progress:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  /**
   * Marca una tarea como completada
   */
  const markTaskCompleted = useCallback(
    async (params: Omit<OnboardingProgressParams, 'action'>) => {
      return trackTaskProgress({ ...params, action: 'completed' });
    },
    [trackTaskProgress]
  );

  /**
   * Marca una tarea como no completada
   */
  const markTaskUncompleted = useCallback(
    async (params: Omit<OnboardingProgressParams, 'action'>) => {
      return trackTaskProgress({ ...params, action: 'uncompleted' });
    },
    [trackTaskProgress]
  );

  /**
   * Obtiene el progreso actual del onboarding desde la base de datos
   */
  const getOnboardingProgress = useCallback(async (storeId: string) => {
    try {
      const result = await client.models.UserStore.get({ storeId });
      if (result.data) {
        const store = result.data;
        return {
          onboardingCompleted: store.onboardingCompleted || false,
          onboardingData: store.onboardingData || {},
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return null;
    }
  }, []);

  return {
    trackTaskProgress,
    markTaskCompleted,
    markTaskUncompleted,
    getOnboardingProgress,
  };
}
