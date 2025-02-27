import type { PostAuthenticationTriggerHandler } from 'aws-lambda'
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  type AdminUpdateUserAttributesCommandInput,
} from '@aws-sdk/client-cognito-identity-provider'

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
 * Asigna el plan gratuito al usuario
 */
const assignFreePlan = async (userPoolId: string, username: string): Promise<void> => {
  await updateUserAttributes({
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes: [
      {
        Name: userAttributes.plan,
        Value: 'free',
      },
    ],
  })
}

export const handler: PostAuthenticationTriggerHandler = async event => {
  try {
    // Verificar inicio de sesión con Google
    const identitiesAttr = event.request.userAttributes[userAttributes.identities]
    if (!identitiesAttr) {
      console.log('No se encontraron identidades. Finalizando proceso.')
      return event
    }

    const identities = JSON.parse(identitiesAttr) as Identity[]
    const isGoogleLogin = identities.some(identity => identity.providerName === 'Google')

    if (!isGoogleLogin) {
      console.log('El usuario no inició sesión con Google. Terminando ejecución.')
      return event
    }

    // Procesar verificación de email si es necesario
    const isEmailVerified = event.request.userAttributes[userAttributes.emailVerified] === 'true'
    if (!isEmailVerified) {
      console.log('El email no está verificado. Verificando el email...')
      await verifyEmail(event.userPoolId, event.userName)
      console.log('Email verificado exitosamente.')
    }

    // Asignar plan gratuito si no existe
    const currentPlan = event.request.userAttributes[userAttributes.plan]
    if (!currentPlan) {
      console.log("Asignando plan 'free' al usuario...")
      await assignFreePlan(event.userPoolId, event.userName)
      event.request.userAttributes[userAttributes.plan] = 'free'
      console.log("Plan 'free' asignado exitosamente.")
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
