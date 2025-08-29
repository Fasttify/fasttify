import { SQSClient, SendMessageCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';
import { SQSEmailMessage, BulkEmailRequest } from '../types';
// import { env } from '$amplify/env/bulk-email-processor';

const sqsClient = new SQSClient();
const EMAIL_QUEUE_URL = process.env.EMAIL_QUEUE_URL;
const HIGH_PRIORITY_QUEUE_URL = process.env.HIGH_PRIORITY_QUEUE_URL;
const BATCH_SIZE = 10;

export class EmailQueueService {
  /**
   * Envía trabajos de email a la cola SQS apropiada
   */
  static async enqueueEmailJobs(request: BulkEmailRequest): Promise<string[]> {
    const jobIds: string[] = [];
    const messages: SQSEmailMessage[] = [];

    for (const recipient of request.recipients) {
      const jobId = uuidv4();
      jobIds.push(jobId);

      const message: SQSEmailMessage = {
        jobId,
        templateId: request.templateId,
        recipient,
        templateVariables: request.templateVariables || {},
        sender: request.sender || {
          email: process.env.SES_FROM_EMAIL || 'noreply@fasttify.com',
          name: 'Fasttify',
        },
        priority: request.priority || 'normal',
        attempt: 1,
        maxAttempts: 3,
        metadata: {
          campaignId: request.metadata?.campaignId,
          scheduledAt: request.scheduledAt?.toISOString(),
          tags: request.tags || [],
          ...request.metadata,
        },
      };

      messages.push(message);
    }

    // Enviar mensajes a SQS en lotes
    await this.sendMessagesInBatches(messages, request.priority || 'normal');
    return jobIds;
  }

  /**
   * Envía mensajes a SQS en lotes optimizados
   */
  private static async sendMessagesInBatches(
    messages: SQSEmailMessage[],
    priority: 'low' | 'normal' | 'high'
  ): Promise<void> {
    const queueUrl = priority === 'high' ? HIGH_PRIORITY_QUEUE_URL : EMAIL_QUEUE_URL;

    if (!queueUrl) {
      throw new Error(`SQS queue not configured for priority: ${priority}`);
    }

    // Dividir mensajes en lotes de 10 (límite SQS)
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);

      if (batch.length === 1) {
        // Enviar mensaje individual
        await this.sendSingleMessage(batch[0], queueUrl);
      } else {
        // Enviar lote de mensajes
        await this.sendMessageBatch(batch, queueUrl);
      }
    }
  }

  /**
   * Envía un mensaje individual a SQS
   */
  private static async sendSingleMessage(message: SQSEmailMessage, queueUrl: string): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        priority: {
          StringValue: message.priority,
          DataType: 'String',
        },
        templateId: {
          StringValue: message.templateId,
          DataType: 'String',
        },
        attempt: {
          StringValue: message.attempt.toString(),
          DataType: 'Number',
        },
      },
      // Delay basado en prioridad
      DelaySeconds: message.priority === 'high' ? 0 : message.priority === 'normal' ? 10 : 30,
    });

    await sqsClient.send(command);
  }

  /**
   * Envía un lote de mensajes a SQS
   */
  private static async sendMessageBatch(messages: SQSEmailMessage[], queueUrl: string): Promise<void> {
    const entries = messages.map((message, index) => ({
      Id: `msg-${index}`,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        priority: {
          StringValue: message.priority,
          DataType: 'String',
        },
        templateId: {
          StringValue: message.templateId,
          DataType: 'String',
        },
        attempt: {
          StringValue: message.attempt.toString(),
          DataType: 'Number',
        },
      },
      DelaySeconds: message.priority === 'high' ? 0 : message.priority === 'normal' ? 10 : 30,
    }));

    const command = new SendMessageBatchCommand({
      QueueUrl: queueUrl,
      Entries: entries,
    });

    const result = await sqsClient.send(command);

    // Manejar fallos en el lote
    if (result.Failed && result.Failed.length > 0) {
      console.error('Failed to send batch to SQS:', result.Failed);
      throw new Error(`Failed to send ${result.Failed.length} messages to queue`);
    }
  }

  /**
   * Reintentar trabajo fallido
   */
  static async requeueFailedJob(message: SQSEmailMessage): Promise<void> {
    if (message.attempt >= message.maxAttempts) {
      console.error(`Job ${message.jobId} exceeded maximum attempts`);
      return;
    }

    const retriedMessage: SQSEmailMessage = {
      ...message,
      attempt: message.attempt + 1,
    };

    const queueUrl = message.priority === 'high' ? HIGH_PRIORITY_QUEUE_URL : EMAIL_QUEUE_URL;

    if (!queueUrl) {
      throw new Error(`SQS queue not configured for priority: ${message.priority}`);
    }

    await this.sendSingleMessage(retriedMessage, queueUrl);
  }

  /**
   * Crea mensajes de email para procesamiento directo (fallback)
   */
  static async createEmailMessages(request: BulkEmailRequest): Promise<SQSEmailMessage[]> {
    const messages: SQSEmailMessage[] = [];

    // Crear mensajes para cada destinatario
    for (const recipient of request.recipients) {
      const jobId = uuidv4();

      const message: SQSEmailMessage = {
        jobId,
        templateId: request.templateId,
        recipient,
        templateVariables: request.templateVariables || {},
        sender: request.sender || {
          email: process.env.SES_FROM_EMAIL || 'noreply@fasttify.com',
          name: 'Fasttify',
        },
        priority: request.priority || 'normal',
        attempt: 1,
        maxAttempts: 3,
        metadata: {
          campaignId: request.metadata?.campaignId,
          scheduledAt: request.scheduledAt?.toISOString(),
          tags: request.tags || [],
          ...request.metadata,
        },
      };

      messages.push(message);
    }

    return messages;
  }
}
