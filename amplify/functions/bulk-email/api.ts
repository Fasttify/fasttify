import { Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { BulkEmailRequest, SQSEmailMessage } from './types';
import { EmailService } from './services/email-service';
import { EmailQueueService } from './services/email-queue-service';
import { validateBulkEmailRequest, sanitizeTemplateVariables } from './utils/validation';
import { MetricsCollector, logEmailCampaignMetrics } from './utils/metrics';
import { getEmailConfig } from './config/email-config';
import { getCorsHeaders } from '../shared/cors';
import { env } from '$amplify/env/bulk-email-processor';

export const handler: Handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    };
  }

  try {
    // Manejar preflight CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({ message: 'CORS preflight successful' }),
      };
    }

    // Solo permitir POST para envío masivo
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Parsear el body
    let requestBody: BulkEmailRequest;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (error) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({ error: 'Invalid JSON in body' }),
      };
    }

    // Validar request
    const validation = validateBulkEmailRequest(requestBody);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({
          error: validation.errors[0],
          errors: validation.errors,
          warnings: validation.warnings,
        }),
      };
    }

    // Procesar la ruta
    const path = event.path || event.requestContext?.path || '';

    if (path.includes('/send-bulk')) {
      return await handleSendBulkEmail(requestBody, getCorsHeaders(origin));
    }

    if (path.includes('/test-email')) {
      return await handleTestEmail(requestBody, getCorsHeaders(origin));
    }

    return {
      statusCode: 404,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Error in bulk email API:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

/**
 * Maneja el envío masivo de emails
 */
async function handleSendBulkEmail(request: BulkEmailRequest, headers: Record<string, string>) {
  const campaignId = uuidv4();
  const config = getEmailConfig(env);
  const metricsCollector = new MetricsCollector();
  const startTime = Date.now();

  metricsCollector.startOperation('bulk-email-campaign', {
    campaignId,
    templateId: request.templateId,
    recipientCount: request.recipients.length,
    priority: request.priority || 'normal',
  });

  // Sanitizar variables de template
  const sanitizedVariables = request.templateVariables ? sanitizeTemplateVariables(request.templateVariables) : {};

  // Agregar ID de campaña a los metadatos
  const enrichedRequest = {
    ...request,
    templateVariables: sanitizedVariables,
    metadata: {
      campaignId,
      ...request.metadata,
    },
  };

  try {
    if (config.useQueue) {
      // Usar SQS para procesamiento asíncrono
      const jobIds = await EmailQueueService.enqueueEmailJobs(enrichedRequest, env);
      const estimatedDeliveryTime = calculateEstimatedDelivery(request.recipients.length);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          campaignId,
          jobsCreated: jobIds.length,
          estimatedDeliveryTime,
          processingMode: 'async',
          message: `Campaign ${campaignId} enqueued with ${jobIds.length} emails. Processing in progress...`,
        }),
      };
    } else {
      // Fallback: procesamiento directo
      const messages = await EmailQueueService.createEmailMessages(enrichedRequest, env);
      const results = await EmailService.processBatch(messages, env);

      const estimatedDeliveryTime = calculateEstimatedDelivery(messages.length);

      // Registrar métricas
      const endTime = Date.now();
      logEmailCampaignMetrics({
        timestamp: new Date(),
        campaignId,
        templateId: request.templateId,
        totalRecipients: messages.length,
        successCount: results.success,
        failureCount: results.failed,
        processingTimeMs: endTime - startTime,
        priority: request.priority || 'normal',
        processingMode: 'sync',
        errorTypes: {}, // TODO: Agregar conteo de tipos de errores
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          campaignId,
          jobsCreated: messages.length,
          estimatedDeliveryTime,
          processingMode: 'sync',
          results,
          message: `Campaign started with ${messages.length} emails. Success: ${results.success}, Failed: ${results.failed}`,
        }),
      };
    }
  } catch (error) {
    console.error('Error processing campaign:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error processing email campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * Maneja el envío de email de prueba
 */
async function handleTestEmail(request: BulkEmailRequest, headers: Record<string, string>) {
  if (request.recipients.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Must specify at least one recipient for test' }),
    };
  }

  // Usar solo el primer destinatario para prueba
  const recipient = request.recipients[0];
  const jobId = uuidv4();

  const message: SQSEmailMessage = {
    jobId,
    templateId: request.templateId,
    recipient,
    templateVariables: request.templateVariables || {},
    sender: request.sender || {
      email: env.SES_FROM_EMAIL || 'noreply@fasttify.com',
      name: 'Fasttify',
    },
    priority: 'high',
    attempt: 1,
    maxAttempts: 1,
    metadata: {
      test: true,
      ...request.metadata,
    },
  };

  try {
    const success = await EmailService.sendEmail(message, env);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success,
        jobId,
        recipient: recipient.email,
        templateId: request.templateId,
        message: success ? 'Test email sent successfully' : 'Error sending test email',
      }),
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error sending test email',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * Calcula tiempo estimado de entrega
 */
function calculateEstimatedDelivery(emailCount: number): string {
  const rateLimit = parseInt(env.RATE_LIMIT_PER_SECOND || '10');
  const estimatedSeconds = Math.ceil(emailCount / rateLimit);

  if (estimatedSeconds < 60) {
    return `${estimatedSeconds} seconds`;
  }

  const minutes = Math.ceil(estimatedSeconds / 60);
  return `${minutes} minutes`;
}
