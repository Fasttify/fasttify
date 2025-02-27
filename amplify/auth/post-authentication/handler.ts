import type { PostAuthenticationTriggerHandler } from 'aws-lambda'
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  type AdminUpdateUserAttributesCommandInput,
} from '@aws-sdk/client-cognito-identity-provider'
import { Amplify } from 'aws-amplify'
import { env } from '$amplify/env/post-authentication'
import { generateClient } from 'aws-amplify/data'
import { type Schema } from '../../data/resource'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
Amplify.configure(resourceConfig, libraryOptions)

const clientSchema = generateClient<Schema>()

/**
 * Constantes para los atributos de usuario en Cognito
 */
const userAttributes = {
  emailVerified: 'email_verified',
  identities: 'identities',
  plan: 'custom:plan',
} as const

/**
 * Interface para la estructura de identidad de proveedores externos
 */
interface Identity {
  providerName: string
  userId: string
}

const client = new CognitoIdentityProviderClient()

/**
 * Actualiza los atributos del usuario en Cognito
 */
const updateUserAttributes = async (
  params: AdminUpdateUserAttributesCommandInput
): Promise<void> => {
  const command = new AdminUpdateUserAttributesCommand(params)
  await client.send(command)
}

/**
 * Verifica el email del usuario
 */
const verifyEmail = async (userPoolId: string, username: string): Promise<void> => {
  await updateUserAttributes({
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes: [
      {
        Name: userAttributes.emailVerified,
        Value: 'true',
      },
    ],
  })
}

/**
 * Asigna el plan Royal con prueba gratuita al usuario
 */
const assignRoyalTrialPlan = async (userPoolId: string, username: string): Promise<void> => {
  // Asignar plan Royal en Cognito
  await updateUserAttributes({
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes: [
      {
        Name: userAttributes.plan,
        Value: 'Royal',
      },
    ],
  })

  // Calcular la fecha de finalización de la prueba (7 días a partir de ahora)
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 7)

  try {
    // Crear registro de suscripción con plan pendiente
    await clientSchema.models.UserSubscription.create({
      userId: username,
      subscriptionId: `trial-${username}`,
      planName: 'Royal',
      pendingPlan: 'free',
      pendingStartDate: trialEndDate.toISOString(),
    })

    console.log(
      `Prueba gratuita configurada para el usuario ${username}, finaliza el ${trialEndDate.toISOString()}`
    )
  } catch (error) {
    console.error('Error al guardar la información de prueba gratuita:', error)
  }
}

export const handler: PostAuthenticationTriggerHandler = async event => {
  try {
    // Verificar si es un inicio de sesión con proveedor externo
    const identitiesAttr = event.request.userAttributes[userAttributes.identities]

    // Verificar email para proveedores externos
    if (identitiesAttr) {
      const identities = JSON.parse(identitiesAttr) as Identity[]

      // Si es Google y el email no está verificado, verificarlo
      const isGoogleLogin = identities.some(identity => identity.providerName === 'Google')
      if (isGoogleLogin && event.request.userAttributes[userAttributes.emailVerified] !== 'true') {
        console.log('Inicio de sesión con Google. Verificando el email...')
        await verifyEmail(event.userPoolId, event.userName)
        console.log('Email verificado exitosamente.')
      }
    }

    // Asignar plan Royal de prueba si no existe un plan (para cualquier tipo de inicio de sesión)
    const currentPlan = event.request.userAttributes[userAttributes.plan]
    if (!currentPlan) {
      console.log(`Usuario ${event.userName}: Asignando plan 'Royal' de prueba por 7 días...`)
      await assignRoyalTrialPlan(event.userPoolId, event.userName)
      event.request.userAttributes[userAttributes.plan] = 'Royal'
      console.log(`Usuario ${event.userName}: Plan 'Royal' de prueba asignado exitosamente.`)
    } else {
      console.log(`Usuario ${event.userName}: Ya tiene plan asignado: ${currentPlan}`)
    }

    return event
  } catch (error) {
    console.error('Error en el manejador post-autenticación:', {
      error,
      userId: event.userName,
      userPoolId: event.userPoolId,
    })

    // Re-lanzar el error para que AWS lo maneje adecuadamente
    throw error
  }
}
