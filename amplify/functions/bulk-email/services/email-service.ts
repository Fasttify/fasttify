import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SQSEmailMessage } from '../types';
import { env } from '$amplify/env/bulk-email-processor';

const sesClient = new SESClient();

export class EmailService {
  /**
   * Envía un email individual usando SES
   */
  static async sendEmail(message: SQSEmailMessage): Promise<boolean> {
    try {
      const htmlContent = await this.renderTemplate(message.templateId, message.templateVariables);

      const command = new SendEmailCommand({
        Source: message.sender.email,
        Destination: {
          ToAddresses: [message.recipient.email],
        },
        Message: {
          Subject: {
            Data: await this.renderSubject(message.templateId, message.templateVariables),
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlContent,
              Charset: 'UTF-8',
            },
          },
        },
        ReplyToAddresses: [env.SES_REPLY_TO_EMAIL || 'support@fasttify.com'],
      });

      await sesClient.send(command);

      return true;
    } catch (error) {
      console.error('Error sending email:', {
        jobId: message.jobId,
        recipient: message.recipient.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Renderiza el template de email con las variables
   */
  private static async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    // Templates básicos para empezar
    const templates: Record<string, string> = {
      'order-confirmation': `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">¡Pedido Confirmado!</h1>
            <p>Hola {{customerName}},</p>
            <p>Tu pedido <strong>#{{orderId}}</strong> ha sido confirmado exitosamente.</p>
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
              <h3>Detalles del pedido:</h3>
              <p><strong>Total:</strong> {{total}}</p>
              <p><strong>Fecha:</strong> {{orderDate}}</p>
            </div>
            <p>Te notificaremos cuando tu pedido sea enviado.</p>
            <p>Gracias por tu compra,<br>Equipo de {{storeName}}</p>
          </body>
        </html>
      `,
      'shipping-update': `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">¡Tu pedido está en camino!</h1>
            <p>Hola {{customerName}},</p>
            <p>Tu pedido <strong>#{{orderId}}</strong> ha sido enviado.</p>
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
              <h3>Información de envío:</h3>
              <p><strong>Número de seguimiento:</strong> {{trackingNumber}}</p>
              <p><strong>Transportadora:</strong> {{carrier}}</p>
            </div>
            <p>Puedes rastrear tu paquete usando el número de seguimiento.</p>
            <p>Saludos,<br>Equipo de {{storeName}}</p>
          </body>
        </html>
      `,
      'new-order-notification': `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">¡Nuevo Pedido Recibido!</h1>
            <p>Hola {{storeOwnerName}},</p>
            <p>Has recibido un nuevo pedido en tu tienda <strong>{{storeName}}</strong>.</p>
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
              <h3>Detalles del pedido:</h3>
              <p><strong>Pedido:</strong> #{{orderId}}</p>
              <p><strong>Cliente:</strong> {{customerEmail}}</p>
              <p><strong>Total:</strong> {{total}}</p>
            </div>
            <p>Ingresa a tu panel de administración para ver los detalles completos.</p>
            <p>Saludos,<br>Equipo de Fasttify</p>
          </body>
        </html>
      `,
      promotion: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">{{title}}</h1>
            <p>Hola {{customerName}},</p>
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
              {{content}}
            </div>
            {{#if discountCode}}
            <div style="background: #e8f5e8; padding: 15px; text-align: center; margin: 20px 0;">
              <p><strong>Código de descuento:</strong> {{discountCode}}</p>
            </div>
            {{/if}}
            <p>Saludos,<br>Equipo de {{storeName}}</p>
          </body>
        </html>
      `,
    };

    let template = templates[templateId] || templates['order-confirmation'];

    // Reemplazar variables básicas con {{variable}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, String(value));
    }

    return template;
  }

  /**
   * Renderiza el asunto del email
   */
  private static async renderSubject(templateId: string, variables: Record<string, any>): Promise<string> {
    const subjects: Record<string, string> = {
      'order-confirmation': 'Pedido confirmado #{{orderId}} - {{storeName}}',
      'shipping-update': 'Tu pedido #{{orderId}} está en camino - {{storeName}}',
      'new-order-notification': 'Nuevo pedido #{{orderId}} en {{storeName}}',
      promotion: '{{title}} - {{storeName}}',
    };

    let subject = subjects[templateId] || 'Notificación de {{storeName}}';

    // Reemplazar variables en el asunto
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
    }

    return subject;
  }

  /**
   * Procesa un lote de emails
   */
  static async processBatch(messages: SQSEmailMessage[]): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };
    const rateLimit = parseInt(env.RATE_LIMIT_PER_SECOND || '10');

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
