import type { PostConfirmationTriggerHandler } from 'aws-lambda'
import { type Schema } from '../../data/resource'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/post-confirmation'
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { sendWelcomeEmail } from './services/email-service'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)

Amplify.configure(resourceConfig, libraryOptions)

const client = generateClient<Schema>()
const cognitoClient = new CognitoIdentityProviderClient()

export const handler: PostConfirmationTriggerHandler = async event => {
  // Crear el perfil de usuario
  await client.models.UserProfile.create({
    email: event.request.userAttributes.email,
    profileOwner: `${event.request.userAttributes.sub}::${event.userName}`,
  })

  // Calcular fecha de finalización de la prueba (7 días a partir de hoy)
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 7)
  const trialEndDateISO = trialEndDate.toISOString()

  // Asignar plan 'royal' como prueba gratuita en Cognito
  try {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      UserAttributes: [
        {
          Name: 'custom:plan',
          Value: 'Royal',
        },
        {
          Name: 'custom:user_type',
          Value: 'store_owner',
        },
      ],
    })

    await cognitoClient.send(command)

    // Crear registro en la tabla UserSubscription
    try {
      await client.models.UserSubscription.create({
        userId: event.userName,
        subscriptionId: `trial-${event.userName}-${Date.now()}`, // ID único para la suscripción de prueba
        planName: 'Royal',
        pendingPlan: 'free', // Plan que se asignará cuando termine la prueba
        pendingStartDate: trialEndDateISO, // Fecha en que se asignará el plan free
        planPrice: 0, // Es una prueba gratuita
      })

      // Enviar email de bienvenida con información de la prueba
      const userEmail = event.request.userAttributes.email
      if (userEmail) {
        await sendWelcomeEmail(userEmail, trialEndDate)
      }
    } catch (dbError) {
      console.error('Error creando registro de suscripción en DynamoDB:', dbError)
    }
  } catch (error) {
    console.error('Error asignando prueba gratuita al usuario:', error)
  }

  return event
}
