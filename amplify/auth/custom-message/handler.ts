import type { CustomMessageTriggerHandler } from 'aws-lambda'

export const handler: CustomMessageTriggerHandler = async event => {
  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    // Lógica para Forgot Password
    event.response.emailMessage = `Tu nuevo código de un solo uso es ${event.request.codeParameter}`
    event.response.emailSubject = 'Restablecer mi contraseña'
  } else if (event.triggerSource === 'CustomMessage_SignUp') {
    // Lógica para Sign Up
    event.response.emailMessage = `Tu nuevo código de un solo uso es ${event.request.codeParameter}`
    event.response.emailSubject = 'Verifica tu cuenta'
  }

  return event
}
