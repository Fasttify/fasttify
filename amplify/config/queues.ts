/**
 * Configuración de colas SQS para el sistema de emails
 */

import { Stack, Duration } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { stageName } from './environment';

export interface EmailQueues {
  emailQueue: Queue;
  highPriorityEmailQueue: Queue;
}

/**
 * Crea las colas SQS para el sistema de emails masivos
 */
export function createEmailQueues(stack: Stack): EmailQueues {
  const emailQueue = new Queue(stack, 'EmailQueue', {
    queueName: `email-queue-${stageName}`,
    visibilityTimeout: Duration.minutes(15), // Tiempo para procesar emails
    receiveMessageWaitTime: Duration.seconds(20), // Long polling
    deadLetterQueue: {
      queue: new Queue(stack, 'EmailDeadLetterQueue', {
        queueName: `email-dlq-${stageName}`,
      }),
      maxReceiveCount: 3, // Máximo 3 reintentos antes de DLQ
    },
  });

  const highPriorityEmailQueue = new Queue(stack, 'HighPriorityEmailQueue', {
    queueName: `email-high-priority-queue-${stageName}`,
    visibilityTimeout: Duration.minutes(15),
    receiveMessageWaitTime: Duration.seconds(20),
    deadLetterQueue: {
      queue: new Queue(stack, 'HighPriorityEmailDeadLetterQueue', {
        queueName: `email-high-priority-dlq-${stageName}`,
      }),
      maxReceiveCount: 3,
    },
  });

  return { emailQueue, highPriorityEmailQueue };
}

/**
 * Configura los event sources para las lambdas de procesamiento de email
 */
export function configureEmailEventSources(
  bulkEmailProcessor: any,
  emailQueue: Queue,
  highPriorityEmailQueue: Queue
): void {
  // Conectar las colas al procesador de emails
  bulkEmailProcessor.resources.lambda.addEventSource(
    new SqsEventSource(emailQueue, {
      batchSize: 10, // Procesar hasta 10 mensajes por vez
      maxBatchingWindow: Duration.seconds(30),
    })
  );

  bulkEmailProcessor.resources.lambda.addEventSource(
    new SqsEventSource(highPriorityEmailQueue, {
      batchSize: 5, // Menor batch para alta prioridad = más rápido
      maxBatchingWindow: Duration.seconds(10),
    })
  );
}

/**
 * Configura las variables de entorno para las lambdas relacionadas con email
 */
export function configureEmailEnvironmentVariables(
  bulkEmailAPI: any,
  bulkEmailProcessor: any,
  emailQueue: Queue,
  highPriorityEmailQueue: Queue
): void {
  // Configurar variables de entorno usando node context
  bulkEmailAPI.resources.lambda.node.addDependency(emailQueue);
  bulkEmailAPI.resources.lambda.node.addDependency(highPriorityEmailQueue);
  bulkEmailProcessor.resources.lambda.node.addDependency(emailQueue);
  bulkEmailProcessor.resources.lambda.node.addDependency(highPriorityEmailQueue);

  // Usar CfnFunction para configurar variables de entorno
  const apiLambda = bulkEmailAPI.resources.lambda.node.defaultChild as CfnFunction;
  const processorLambda = bulkEmailProcessor.resources.lambda.node.defaultChild as CfnFunction;

  if (apiLambda) {
    apiLambda.addPropertyOverride('Environment.Variables.EMAIL_QUEUE_URL', emailQueue.queueUrl);
    apiLambda.addPropertyOverride('Environment.Variables.HIGH_PRIORITY_QUEUE_URL', highPriorityEmailQueue.queueUrl);
  }

  if (processorLambda) {
    processorLambda.addPropertyOverride('Environment.Variables.EMAIL_QUEUE_URL', emailQueue.queueUrl);
    processorLambda.addPropertyOverride(
      'Environment.Variables.HIGH_PRIORITY_QUEUE_URL',
      highPriorityEmailQueue.queueUrl
    );
  }
}
