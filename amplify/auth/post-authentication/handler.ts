import type { PostAuthenticationTriggerHandler } from 'aws-lambda'
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const client = new CognitoIdentityProviderClient()

export const handler: PostAuthenticationTriggerHandler = async event => {
  // Solo proceder si es un inicio de sesión con Google
  const identitiesAttr = event.request.userAttributes['identities']
  if (!identitiesAttr) {
    return event
  }

  const identities = JSON.parse(identitiesAttr)
  const isGoogleLogin = identities.some((identity: any) => identity.providerName === 'Google')

  if (!isGoogleLogin) {
    console.log('El usuario no inició sesión con Google. Terminando ejecución.')
    return event
  }

  // Verificar si el email está verificado
  if (event.request.userAttributes['email_verified'] !== 'true') {
    try {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: event.userPoolId,
        Username: event.userName,
        UserAttributes: [
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
      })

      await client.send(command)
    } catch (error) {
      console.error('Error al verificar el email del usuario:', error)
    }
  }

  return event
}
