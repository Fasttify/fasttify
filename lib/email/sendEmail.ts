import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Configurar cliente SES
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Envía un email usando AWS SES
 * @param params Parámetros del email
 * @returns Resultado del envío
 */
export async function sendEmail(params: SendEmailParams) {
  const {
    to,
    subject,
    html,
    from = process.env.SES_FROM_EMAIL || 'noreply@fasttify.com',
    replyTo = process.env.SES_REPLY_TO_EMAIL || 'support@fasttify.com',
  } = params;

  try {
    const command = new SendEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
        },
      },
      ReplyToAddresses: [replyTo],
    });

    const result = await sesClient.send(command);

    console.log('Email enviado exitosamente:', {
      messageId: result.MessageId,
      to,
      subject,
    });

    return result;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error(`Error enviando email: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Envía un email de prueba (para desarrollo)
 * @param params Parámetros del email
 */
export async function sendTestEmail(params: SendEmailParams) {
  if (process.env.APP_ENV === 'production') {
    throw new Error('sendTestEmail only available in development');
  }

  // En desarrollo, solo loguear el email
  console.log('📧 EMAIL DE PRUEBA (development):', {
    to: params.to,
    subject: params.subject,
    from: params.from || 'noreply@fasttify.com',
    html: params.html.substring(0, 200) + '...',
  });

  // Simular envío exitoso
  return {
    MessageId: `test-${Date.now()}`,
  };
}
