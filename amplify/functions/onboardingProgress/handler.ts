import { env } from '$amplify/env/onboarding-progress';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { StoreSchema } from '../../data/resource';
import { processOnboardingProgress } from './services/onboardingService';
import type { OnboardingProgressEvent, OnboardingProgressGraphQLResult } from './types';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<StoreSchema>();

/**
 * Handler principal para rastrear el progreso del onboarding
 */
export const handler = async (event: any): Promise<OnboardingProgressGraphQLResult> => {
  try {
    // Extraer los datos del evento GraphQL
    let eventData: OnboardingProgressEvent;

    if (event.arguments) {
      // Si viene desde GraphQL, los datos están en event.arguments
      eventData = event.arguments;
    } else if (typeof event === 'string') {
      // Si viene como string, parsearlo
      eventData = JSON.parse(event);
    } else {
      // Si viene directamente como objeto
      eventData = event;
    }

    const { storeId, taskId, taskTitle, action, userId, timestamp } = eventData;

    // Validar inputs requeridos
    if (!storeId || storeId.trim() === '') {
      console.error('storeId is missing or empty:', storeId);
      throw new Error('storeId is required and cannot be empty');
    }

    if (!taskId || taskId <= 0) {
      console.error('taskId is missing or invalid:', taskId);
      throw new Error('taskId is required and must be greater than 0');
    }

    if (!taskTitle || taskTitle.trim() === '') {
      console.error('taskTitle is missing or empty:', taskTitle);
      throw new Error('taskTitle is required and cannot be empty');
    }

    if (!action || !['completed', 'uncompleted'].includes(action)) {
      console.error('action is missing or invalid:', action);
      throw new Error('action is required and must be "completed" or "uncompleted"');
    }

    // Procesar el progreso del onboarding usando el servicio
    const result = await processOnboardingProgress(client, {
      storeId,
      taskId,
      taskTitle,
      action,
      userId,
      timestamp: timestamp || new Date().toISOString(),
    });

    return result;
  } catch (error) {
    console.error('Error in onboardingProgress handler:', error);
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
