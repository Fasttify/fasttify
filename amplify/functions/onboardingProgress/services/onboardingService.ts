import type { StoreSchema } from '../../../data/resource';
import { generateClient } from 'aws-amplify/data';
import type {
  OnboardingProgressEvent,
  OnboardingProgressResult,
  OnboardingProgress,
  OnboardingTask,
  OnboardingProgressGraphQLResult,
} from '../types';

export const processOnboardingProgress = async (
  client: ReturnType<typeof generateClient<StoreSchema>>,
  event: OnboardingProgressEvent
): Promise<OnboardingProgressGraphQLResult> => {
  try {
    const { storeId, taskId, taskTitle, action, userId, timestamp } = event;

    // Validar el evento
    if (!validateEvent(event)) {
      throw new Error('Invalid onboarding event');
    }

    // Procesar la tarea
    const progress = await updateTaskProgress(client, event);

    // Registrar analytics (opcional)
    await recordAnalytics(event);

    // Enviar notificación si es necesario
    if (action === 'completed') {
      await sendCompletionNotification(event);
    }

    return {
      success: true,
      message: `Task ${taskId} ${action} successfully`,
      progress: {
        storeId: progress.storeId,
        userId: progress.userId || undefined,
        completedTasks: progress.completedTasks,
        totalTasks: progress.totalTasks,
        percentage: progress.percentage,
        lastUpdated: progress.lastUpdated,
        tasks: progress.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          lastUpdated: new Date().toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error('Error processing task progress:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      progress: {
        storeId: '',
        userId: undefined,
        completedTasks: 0,
        totalTasks: 7,
        percentage: 0,
        lastUpdated: new Date().toISOString(),
        tasks: [],
      },
    };
  }
};

/**
 * Valida que el evento tenga todos los campos requeridos
 */
function validateEvent(event: OnboardingProgressEvent): boolean {
  return !!(event.storeId && event.taskId && event.taskTitle && event.action);
}

/**
 * Actualiza el progreso de la tarea en la base de datos
 */
async function updateTaskProgress(
  client: ReturnType<typeof generateClient<StoreSchema>>,
  event: OnboardingProgressEvent
): Promise<OnboardingProgress> {
  const { storeId, taskId, taskTitle, action, userId } = event;

  try {
    // Obtener el store actual
    const storeResult = await client.models.UserStore.get({ storeId });
    if (!storeResult.data) {
      throw new Error(`Store not found: ${storeId}`);
    }

    const store = storeResult.data as any;
    const currentOnboardingData = store.onboardingData || {};

    // Actualizar el estado de la tarea específica
    const updatedOnboardingData = {
      ...currentOnboardingData,
      [`task_${taskId}`]: {
        id: taskId,
        title: taskTitle,
        completed: action === 'completed',
        lastUpdated: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
    };

    // Calcular el progreso total
    const totalTasks = 7; // Basado en defaultStoreTasks
    const completedTasks = Object.values(updatedOnboardingData).filter(
      (task: any) => task && typeof task === 'object' && task.completed
    ).length;

    const percentage = Math.round((completedTasks / totalTasks) * 100);
    const onboardingCompleted = percentage === 100;

    // Actualizar el store en la base de datos
    await client.models.UserStore.update({
      storeId,
      onboardingData: updatedOnboardingData,
      onboardingCompleted,
    });

    return {
      storeId,
      userId,
      completedTasks,
      totalTasks,
      percentage,
      lastUpdated: new Date().toISOString(),
      tasks: Object.values(updatedOnboardingData).filter(
        (task: any) => task && typeof task === 'object' && task.id
      ) as OnboardingTask[],
    };
  } catch (error) {
    console.error('Error updating task progress in database:', error);
    throw error;
  }
}

/**
 * Registra analytics del evento
 */
async function recordAnalytics(event: OnboardingProgressEvent): Promise<void> {
  try {
    // Aquí implementarías el registro en:
    // - CloudWatch Metrics
    // - DynamoDB para analytics
    // - Sistemas externos de tracking

    console.log('Analytics recorded for task:', event.taskId, 'action:', event.action);
  } catch (error) {
    console.warn('Failed to record analytics:', error);
    // No fallamos si no se pueden registrar analytics
  }
}

/**
 * Envía notificación de completado
 */
async function sendCompletionNotification(event: OnboardingProgressEvent): Promise<void> {
  try {
    if (event.action !== 'completed') return;

    // Aquí implementarías:
    // - Envío de emails de felicitación
    // - Notificaciones push
    // - Webhooks a sistemas externos
    // - Actualización de dashboards
  } catch (error) {
    console.warn('Failed to send completion notification:', error);
    // No fallamos si no se pueden enviar notificaciones
  }
}
