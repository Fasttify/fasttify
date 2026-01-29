/**
 * Mensajes de error centralizados para autenticación
 */

import { AuthError } from 'aws-amplify/auth';
export type { AuthError };

/**
 * Obtiene el mensaje de error traducido para errores de registro
 */
export function getSignUpErrorMessage(error: AuthError): string {
  if (error.name) {
    switch (error.name) {
      case 'UsernameExistsException':
        return 'Este correo electrónico ya está registrado';
      case 'InvalidParameterException':
        return 'Uno o más campos contienen datos inválidos';
      case 'InvalidPasswordException':
        return 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos';
      case 'TooManyRequestsException':
        return 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente';
      case 'LimitExceededException':
        return 'Se ha excedido el límite diario de envío de correos. Por favor, intenta mañana o contacta al soporte';
    }
  }

  // Fallback al mensaje si no hay nombre específico
  switch (error.message) {
    case 'Username should be an email.':
      return 'El correo electrónico no tiene un formato válido';
    case 'Password did not conform with policy: Password not long enough':
      return 'La contraseña debe tener al menos 8 caracteres';
    case 'User already exists':
      return 'Este usuario ya existe';
    case 'Attempt limit exceeded, please try after some time.':
      return 'Límite de intentos excedido, por favor intenta más tarde';
    case 'Invalid verification code provided, please try again.':
      return 'Código de verificación inválido, por favor intenta nuevamente';
    default:
      // Verificar si el mensaje contiene información sobre límite de correos
      if (error.message?.includes('Exceeded daily email limit')) {
        return 'Se ha excedido el límite diario de envío de correos. Por favor, intenta mañana o contacta al soporte';
      }
      return error.recoverySuggestion || 'Ha ocurrido un error. Por favor, intenta nuevamente';
  }
}

/**
 * Obtiene el mensaje de error traducido para errores de confirmación de registro
 */
export function getConfirmSignUpErrorMessage(error: AuthError): string {
  // Usar el nombre del error (más confiable que el mensaje)
  if (error.name) {
    switch (error.name) {
      case 'CodeMismatchException':
        return 'El código ingresado no es válido. Por favor, verifica e intenta nuevamente';
      case 'ExpiredCodeException':
        return 'El código ha expirado. Por favor, solicita un nuevo código';
      case 'TooManyRequestsException':
        return 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente';
      case 'NotAuthorizedException':
        return 'No se pudo autorizar la verificación. Por favor, intenta nuevamente';
      case 'UserNotFoundException':
        return 'No se encontró el usuario asociado a este correo';
      case 'LimitExceededException':
        return 'Se ha excedido el límite diario de envío de correos. Por favor, intenta mañana o contacta al soporte';
    }
  }

  // Fallback al mensaje si no hay nombre específico
  switch (error.message) {
    case 'Invalid verification code provided, please try again.':
      return 'Código de verificación inválido, por favor intenta nuevamente';
    case 'Attempt limit exceeded, please try after some time.':
      return 'Límite de intentos excedido, por favor intenta más tarde';
    case 'User cannot be confirmed. Current status is CONFIRMED':
      return 'El usuario ya ha sido confirmado anteriormente';
    case 'Network error':
      return 'Error de conexión. Por favor, verifica tu conexión a internet';
    default:
      // Verificar si el mensaje contiene información sobre límite de correos
      if (error.message?.includes('Exceeded daily email limit')) {
        return 'Se ha excedido el límite diario de envío de correos. Por favor, intenta mañana o contacta al soporte';
      }
      return error.recoverySuggestion || 'Ha ocurrido un error durante la verificación. Por favor, intenta nuevamente';
  }
}

/**
 * Obtiene el mensaje de error traducido para errores de inicio de sesión
 */
export function getSignInErrorMessage(error: AuthError): string {
  // Usar el nombre del error (más confiable que el mensaje)
  if (error.name) {
    switch (error.name) {
      case 'NotAuthorizedException':
        return 'Email o contraseña incorrectos';
      case 'UserNotConfirmedException':
        return 'Por favor confirma tu cuenta primero';
      case 'TooManyRequestsException':
        return 'Demasiados intentos. Por favor, intenta más tarde';
      case 'UserNotFoundException':
        return 'No se encontró una cuenta con este correo electrónico';
      case 'InvalidParameterException':
        return 'Uno o más campos contienen datos inválidos';
      case 'LimitExceededException':
        return 'Se ha excedido el límite de intentos. Por favor, intenta más tarde';
      case 'NetworkError':
        return 'Error de conexión. Por favor, verifica tu internet';
    }
  }

  // Fallback al mensaje si no hay nombre específico
  switch (error.message) {
    case 'Incorrect username or password.':
      return 'Email o contraseña incorrectos';
    case 'Password attempts exceeded':
      return 'Demasiados intentos. Por favor, intenta más tarde';
    case 'UserNotConfirmedException':
      return 'Por favor confirma tu cuenta primero';
    case 'Attempt limit exceeded, please try after some time.':
      return 'Número de intentos excedido. Intenta más tarde';
    case 'NetworkError':
      return 'Error de conexión. Por favor, verifica tu internet';
    case 'There is already a signed in user.':
      return 'Ya hay un usuario autenticado. Por favor, cierra la sesión primero';
    default:
      // Usar recoverySuggestion si está disponible, sino el mensaje por defecto
      return error.recoverySuggestion || error.message || 'Ha ocurrido un error durante el inicio de sesión';
  }
}
