import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { welcomeEmail } from './templates/welcome-email';

const sesClient = new SESClient();

/**
 * Función para reemplazar placeholders en el template con los valores proporcionados.
 */
function replacePlaceholders(template: string, replacements: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Envía el email de bienvenida utilizando SES.
 * @param email Dirección de correo destino.
 * @param trialEndDate Fecha de fin de prueba.
 */
export async function sendWelcomeEmail(email: string, trialEndDate: Date): Promise<boolean> {
  try {
    // Formatea la fecha en español
    const formattedDate = trialEndDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const replacements = {
      trialEndDate: formattedDate,
      currentYear: new Date().getFullYear().toString(),
    };

    // Genera el contenido HTML final reemplazando los placeholders
    const htmlContent = replacePlaceholders(welcomeEmail, replacements);

    // Configura los parámetros para SES (solo HTML)
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
          Data: '¡Bienvenido a Fasttify! Tu prueba gratuita del plan Royal está activa',
        },
      },
      Source: 'noreply@fasttify.com',
    };

    // Envía el correo
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}
