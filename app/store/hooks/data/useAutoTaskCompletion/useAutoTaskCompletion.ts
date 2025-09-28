import { useCallback } from 'react';
import { useOnboardingProgress } from '../useOnboardingProgress/useOnboardingProgress';

/**
 * Hook para marcar automáticamente las tareas del onboarding cuando se completen las acciones reales
 */
export function useAutoTaskCompletion() {
  const { markTaskCompleted } = useOnboardingProgress();

  /**
   * Marca automáticamente una tarea como completada cuando se realiza la acción real
   */
  const completeTask = useCallback(
    async (params: { storeId: string; taskId: number; taskTitle: string; userId?: string }) => {
      try {
        const result = await markTaskCompleted(params);
        if (result.success) {
          return { success: true, data: result.data };
        } else {
          console.error(`Failed to auto-complete task ${params.taskId}:`, result.errors);
          return { success: false, errors: result.errors };
        }
      } catch (error) {
        console.error(`Error auto-completing task ${params.taskId}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
    [markTaskCompleted]
  );

  /**
   * Marca automáticamente la tarea de "Agregar producto" cuando se crea un producto
   */
  const completeAddProductTask = useCallback(
    async (storeId: string, userId?: string) => {
      return completeTask({
        storeId,
        taskId: 1,
        taskTitle: 'Agrega tu primer producto',
        userId,
      });
    },
    [completeTask]
  );

  /**
   * Marca automáticamente la tarea de "Personalizar diseño" cuando se guarda un tema
   */
  const completeCustomizeDesignTask = useCallback(
    async (storeId: string, userId?: string) => {
      return completeTask({
        storeId,
        taskId: 2,
        taskTitle: 'Personaliza el diseño de tu tienda',
        userId,
      });
    },
    [completeTask]
  );

  /**
   * Marca automáticamente la tarea de "Configurar dominio" cuando se configura un dominio
   */
  const completeDomainTask = useCallback(
    async (storeId: string, userId?: string) => {
      return completeTask({
        storeId,
        taskId: 3,
        taskTitle: 'Configura tu dominio personalizado',
        userId,
      });
    },
    [completeTask]
  );

  /**
   * Marca automáticamente la tarea de "Nombre de tienda" cuando se actualiza el nombre
   */
  const completeStoreNameTask = useCallback(
    async (storeId: string, userId?: string) => {
      return completeTask({
        storeId,
        taskId: 4,
        taskTitle: 'Elige un nombre para tu tienda',
        userId,
      });
    },
    [completeTask]
  );

  /**
   * Marca automáticamente la tarea de "Tarifas de envío" cuando se configuran
   */
  const completeShippingTask = useCallback(
    async (storeId: string, userId?: string) => {
      return completeTask({
        storeId,
        taskId: 5,
        taskTitle: 'Define tus tarifas de envío',
        userId,
      });
    },
    [completeTask]
  );

  /**
   * Marca automáticamente la tarea de "Métodos de pago" cuando se configuran
   */
  const completePaymentTask = useCallback(
    async (storeId: string, userId?: string) => {
      return completeTask({
        storeId,
        taskId: 6,
        taskTitle: 'Habilita los métodos de pago',
        userId,
      });
    },
    [completeTask]
  );

  /**
   * Marca automáticamente la tarea de "Compra de prueba" cuando se realiza
   */
  const completeTestOrderTask = useCallback(
    async (storeId: string, userId?: string) => {
      return completeTask({
        storeId,
        taskId: 7,
        taskTitle: 'Realiza una compra de prueba',
        userId,
      });
    },
    [completeTask]
  );

  return {
    completeTask,
    completeAddProductTask,
    completeCustomizeDesignTask,
    completeDomainTask,
    completeStoreNameTask,
    completeShippingTask,
    completePaymentTask,
    completeTestOrderTask,
  };
}
