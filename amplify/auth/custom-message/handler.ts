import type { CustomMessageTriggerHandler } from 'aws-lambda';
import {
  generatePasswordResetEmailHTML,
  generatePasswordResetEmailSubject,
} from './services/templates/password-reset-email-compiled';

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

    // Generar el HTML del template con el placeholder {####} que Cognito reemplazará
    const variables = {
      customerName: userName,
      resetCode: '{####}',
      storeName: 'Fasttify',
      currentYear: new Date().getFullYear().toString(),
    };

    try {
      const htmlContent = generatePasswordResetEmailHTML(variables);
      const subject = generatePasswordResetEmailSubject(variables);

      // Usar el HTML personalizado en el mensaje de Cognito
      event.response.emailMessage = htmlContent;
      event.response.emailSubject = subject;
    } catch (error) {
      console.error('Error generating custom HTML:', error);

      event.response.emailMessage = `Tu código de restablecimiento es {####}`;
      event.response.emailSubject = 'Restablecer contraseña - Fasttify';
    }
  } else if (event.triggerSource === 'CustomMessage_SignUp') {
    // Lógica para Sign Up (mantener simple por ahora)
    event.response.emailMessage = `Tu código de verificación es ${event.request.codeParameter}`;
    event.response.emailSubject = 'Verifica tu cuenta';
  }

  return event;
};
