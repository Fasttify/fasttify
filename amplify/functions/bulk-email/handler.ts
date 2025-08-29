import { Handler } from 'aws-lambda';
import { EmailService } from './services/email-service';
import { SQSEmailMessage } from './types';
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
    // Si viene de SQS, procesar los mensajes
    if (event.Records && Array.isArray(event.Records)) {
      return await processSQSMessages(event.Records);
    }

    // Si viene directo (para testing), procesar como lote
    if (event.messages && Array.isArray(event.messages)) {
      return await processDirectMessages(event.messages);
    }

    // Fallback: procesar un mensaje directo
    if (event.jobId) {
      return await processSingleMessage(event as SQSEmailMessage);
    }

    throw new Error('Invalid event format');
  } catch (error) {
    console.error('Error in bulk email processor:', error);
    throw error;
  }
};

/**
 * Procesa mensajes que vienen de SQS
 */
async function processSQSMessages(records: any[]) {
  const messages: SQSEmailMessage[] = [];

  for (const record of records) {
    try {
      const message = JSON.parse(record.body) as SQSEmailMessage;
      messages.push(message);
    } catch (error) {
      console.error('Error parsing SQS message:', error);
    }
  }

  if (messages.length === 0) {
    return { success: 0, failed: 0, message: 'No valid messages to process' };
  }

  const results = await EmailService.processBatch(messages, env);

  return {
    ...results,
    message: `Processed ${results.success + results.failed} emails. Success: ${results.success}, Failed: ${results.failed}`,
  };
}

/**
 * Procesa mensajes enviados directamente (para testing)
 */
async function processDirectMessages(messages: SQSEmailMessage[]) {
  const results = await EmailService.processBatch(messages, env);

  return {
    ...results,
    message: `Processed ${results.success + results.failed} emails. Success: ${results.success}, Failed: ${results.failed}`,
  };
}

/**
 * Procesa un solo mensaje
 */
async function processSingleMessage(message: SQSEmailMessage) {
  const success = await EmailService.sendEmail(message, env);

  return {
    success: success ? 1 : 0,
    failed: success ? 0 : 1,
    jobId: message.jobId,
    message: success ? 'Email sent successfully' : 'Error sending email',
  };
}
