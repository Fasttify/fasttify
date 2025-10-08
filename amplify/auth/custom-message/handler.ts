import type { CustomMessageTriggerHandler } from 'aws-lambda';
import { sendPasswordResetEmail } from './services/email-service';

export const handler: CustomMessageTriggerHandler = async (event) => {
  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    // Obtener información del usuario
    const userEmail = event.request.userAttributes.email;
    const userName =
      event.request.userAttributes.name ||
      event.request.userAttributes.given_name ||
      event.request.userAttributes.nickname ||
      event.request.userAttributes['custom:name'] ||
      userEmail?.split('@')[0] ||
      'Usuario';

    const resetCode = event.request.codeParameter;

    // Enviar email personalizado con template
    if (userEmail) {
      try {
        const emailSent = await sendPasswordResetEmail(userEmail, resetCode, userName);

        if (emailSent) {
          // Si el email se envió correctamente, usar el template personalizado
          event.response.emailMessage = `Tu código de restablecimiento es ${resetCode}`;
          event.response.emailSubject = 'Restablecer contraseña - Fasttify';
        } else {
          // Fallback al mensaje simple si hay error
          event.response.emailMessage = `Tu código de restablecimiento es ${resetCode}`;
          event.response.emailSubject = 'Restablecer mi contraseña';
        }
      } catch (error) {
        console.error('Error sending password reset email:', error);
        // Fallback al mensaje simple
        event.response.emailMessage = `Tu código de restablecimiento es ${resetCode}`;
        event.response.emailSubject = 'Restablecer mi contraseña';
      }
    } else {
      // Fallback si no hay email
      event.response.emailMessage = `Tu código de restablecimiento es ${resetCode}`;
      event.response.emailSubject = 'Restablecer mi contraseña';
    }
  } else if (event.triggerSource === 'CustomMessage_SignUp') {
    // Lógica para Sign Up (mantener simple por ahora)
    event.response.emailMessage = `Tu código de verificación es ${event.request.codeParameter}`;
    event.response.emailSubject = 'Verifica tu cuenta';
  }

  return event;
};
