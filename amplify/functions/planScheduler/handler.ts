import { env } from '$amplify/env/planScheduler';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { EventBridgeHandler } from 'aws-lambda';
import { type Schema } from '../../data/resource';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const clientSchema = generateClient<Schema>();
const cognitoClient = new CognitoIdentityProviderClient();

type UserSubscription = {
  id: string;
  userId: string;
  subscriptionId: string;
  planName: string;
  nextPaymentDate?: string | null;
  pendingPlan?: string | null;
  pendingStartDate?: string | null;
  planPrice?: number | null;
  lastFourDigits?: number | null;
  createdAt: string;
  updatedAt: string;
};

type ListResponse<T> = {
  data: T[];
  nextToken?: string | null;
};

export const handler: EventBridgeHandler<'Scheduled Event', null, void> = async (event: any) => {
  try {
    // 1. Obtener la fecha actual
    const now = new Date();

    // 2. Consultar DynamoDB para obtener las suscripciones pendientes con un plan asignado
    // Modificado para solo procesar suscripciones que realmente han expirado o tienen un cambio de plan programado
    let nextToken: string | undefined = undefined;
    let allPendingSubscriptions: UserSubscription[] = [];

    do {
      const response: ListResponse<UserSubscription> =
        await clientSchema.models.UserSubscription.listUserSubscriptionByPendingPlan(
          { pendingPlan: 'free' },
          {
            filter: { pendingStartDate: { lt: now.toISOString() } },
            limit: 100,
            nextToken,
          }
        );
      const pendingSubscriptions = response.data || [];
      allPendingSubscriptions.push(...pendingSubscriptions);
      nextToken = response.nextToken || undefined;
    } while (nextToken);

    // 3. Iterar sobre cada registro pendiente
    for (const subscription of allPendingSubscriptions) {
      const userId = subscription.userId;
      if (!userId) {
        console.warn('Subscription without userId, skipping');
        continue;
      }

      // Leer el valor del plan pendiente desde el registro
      const newPlan = subscription.pendingPlan;
      if (!newPlan) {
        console.warn(`The subscription for ${userId} does not have a valid pending plan, skipping`);
        continue;
      }

      // Verificar si la suscripción realmente ha expirado o es un cambio de plan programado
      const nextPaymentDate = subscription.nextPaymentDate ? new Date(subscription.nextPaymentDate) : null;
      const pendingStartDate = subscription.pendingStartDate ? new Date(subscription.pendingStartDate) : null;

      // Solo procesar si:
      // 1. No hay fecha de próximo pago (suscripción expirada)
      // 2. La fecha de próximo pago ya pasó (suscripción expirada)
      // 3. La fecha de inicio pendiente está definida y ya pasó (cambio de plan programado)
      const shouldProcess = !nextPaymentDate || nextPaymentDate <= now || (pendingStartDate && pendingStartDate <= now);

      if (!shouldProcess) continue;

      try {
        // 3.1. Actualizar el atributo en Cognito para asignar el plan pendiente
        const updateCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: env.USER_POOL_ID,
          Username: userId,
          UserAttributes: [{ Name: 'custom:plan', Value: newPlan }],
        });
        await cognitoClient.send(updateCommand);
      } catch (cognitoError) {
        console.error(`Error updating user ${userId} in Cognito:`, cognitoError);
        continue;
      }

      try {
        // 3.2. Actualizar el registro en DynamoDB asignando el plan pendiente
        await clientSchema.models.UserSubscription.update({
          id: userId,
          subscriptionId: subscription.subscriptionId,
          planName: newPlan,
          nextPaymentDate: null,
          pendingPlan: null,
          pendingStartDate: null,
          planPrice: null,
          lastFourDigits: null,
        });

        // 3.3. Actualizar storeStatus según el tipo de plan
        const isFreePlan = newPlan.toLowerCase() === 'free';
        const newStoreStatus = !isFreePlan; // false para plan free, true para planes de pago

        // Obtener todas las tiendas del usuario
        const userStoresResponse = await clientSchema.models.UserStore.listUserStoreByUserId({
          userId: userId,
        });

        const userStores = userStoresResponse.data || [];

        // Actualizar el storeStatus de todas las tiendas del usuario
        for (const store of userStores) {
          try {
            await clientSchema.models.UserStore.update({
              storeId: store.storeId,
              storeStatus: newStoreStatus,
            });
          } catch (storeUpdateError) {
            console.error(`Error updating store ${store.storeId} status:`, storeUpdateError);
          }
        }
      } catch (dbError) {
        console.error(`Error updating user subscription ${userId} in DynamoDB:`, dbError);
      }
    }
  } catch (error) {
    console.error('Error in scheduled Lambda:', error);
  }
};
