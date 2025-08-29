import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SQSEmailMessage } from '../types';
// import { env } from '$amplify/env/bulk-email-processor';
import { CompiledTemplateService } from './compiled-template-service';

const sesClient = new SESClient();

export class EmailService {
  /**
   * Envía un email individual usando SES
   */
  static async sendEmail(message: SQSEmailMessage): Promise<boolean> {
    try {
      // Validar que el template existe
      if (!CompiledTemplateService.isValidTemplate(message.templateId)) {
        throw new Error(`Template inválido: ${message.templateId}`);
      }

      // Renderizar template usando los templates compilados
      const { html, text, subject } = CompiledTemplateService.renderTemplate(
        message.templateId,
        message.templateVariables
      );

      const command = new SendEmailCommand({
        Source: message.sender.email,
        Destination: {
          ToAddresses: [message.recipient.email],
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
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          },
        },
        ReplyToAddresses: [process.env.SES_REPLY_TO_EMAIL || 'support@fasttify.com'],
      });

      await sesClient.send(command);

      return true;
    } catch (error) {
      console.error('Error sending email:', {
        jobId: message.jobId,
        recipient: message.recipient.email,
        templateId: message.templateId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Procesa un lote de emails
   */
  static async processBatch(messages: SQSEmailMessage[]): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };
    const rateLimit = parseInt(process.env.RATE_LIMIT_PER_SECOND || '10');

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      try {
        const sent = await this.sendEmail(message);
        if (sent) {
          results.success++;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error(`Error processing message ${message.jobId}:`, error);
        results.failed++;
      }

      // Rate limiting: esperar entre emails para no exceder límites de SES
      if (i < messages.length - 1) {
        const delayMs = Math.max(100, 1000 / rateLimit);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}
