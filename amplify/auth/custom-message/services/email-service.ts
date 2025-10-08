import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  generatePasswordResetEmailHTML,
  generatePasswordResetEmailSubject,
} from './templates/password-reset-email-compiled';

const sesClient = new SESClient();

/**
 * Envía el email de restablecimiento de contraseña utilizando SES.
 * @param email Dirección de correo destino.
 * @param resetCode Código de restablecimiento.
 * @param userName Nombre del usuario.
 */
export async function sendPasswordResetEmail(email: string, resetCode: string, userName: string): Promise<boolean> {
  try {
    // Mejorar el nombre del usuario si es genérico
    const displayName = userName === 'Usuario' ? email?.split('@')[0] || 'Usuario' : userName;

    const variables = {
      customerName: displayName,
      resetCode: resetCode,
      storeName: 'Fasttify',
      currentYear: new Date().getFullYear().toString(),
    };

    // Genera el contenido HTML y asunto usando el template compilado
    const htmlContent = generatePasswordResetEmailHTML(variables);
    const subject = generatePasswordResetEmailSubject(variables);

    // Configura los parámetros para SES
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlContent,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: 'noreply@fasttify.com',
    };

    // Envía el correo
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
