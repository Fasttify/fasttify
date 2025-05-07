import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/planScheduler'
import { type Schema } from '../../data/resource'
import type { EventBridgeHandler } from 'aws-lambda'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
Amplify.configure(resourceConfig, libraryOptions)

const clientSchema = generateClient<Schema>()
const cognitoClient = new CognitoIdentityProviderClient()

export const handler: EventBridgeHandler<'Scheduled Event', null, void> = async (event: any) => {
  try {
    // 1. Obtener la fecha actual
    const now = new Date()

    // 2. Consultar DynamoDB para obtener las suscripciones pendientes con un plan asignado
    const pendingSubscriptionsResponse = await clientSchema.models.UserSubscription.list({
      filter: {
        pendingPlan: { attributeExists: true },
        pendingStartDate: { le: now.toISOString() },
      },
    })

    const pendingSubscriptions = pendingSubscriptionsResponse.data || []

    // 3. Iterar sobre cada registro pendiente
    for (const subscription of pendingSubscriptions) {
      const userId = subscription.userId
      if (!userId) {
        console.warn('⚠️ Suscripción sin userId, omitiendo...')
        continue
      }

      // Leer el valor del plan pendiente desde el registro
      const newPlan = subscription.pendingPlan
      if (!newPlan) {
        console.warn(
          `⚠️ La suscripción de ${userId} no tiene un plan pendiente válido, omitiendo...`
        )
        continue
      }

      try {
        // 3.1. Actualizar el atributo en Cognito para asignar el plan pendiente
        const updateCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: env.USER_POOL_ID,
          Username: userId,
          UserAttributes: [{ Name: 'custom:plan', Value: newPlan }],
        })
        await cognitoClient.send(updateCommand)
      } catch (cognitoError) {
        console.error(`❌ Error actualizando usuario ${userId} en Cognito:`, cognitoError)
        continue
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
        })
      } catch (dbError) {
        console.error(
          `❌ Error actualizando suscripción de usuario ${userId} en DynamoDB:`,
          dbError
        )
      }
    }
  } catch (error) {
    console.error('❌ Error en la Lambda programada:', error)
  }
}
