/**
 * Configuración de políticas IAM reutilizables
 */

import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

/**
 * Política para acceso a Amazon Bedrock
 */
export const bedrockPolicyStatement = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'bedrock:InvokeModel',
    'bedrock:InvokeModelWithResponseStream',
    'bedrock:CreateInferenceProfile',
    'bedrock:GetInferenceProfile',
    'bedrock:ListInferenceProfiles',
  ],
  resources: [
    'arn:aws:bedrock:*::foundation-model/*',
    'arn:aws:bedrock:*:*:inference-profile/*',
    'arn:aws:bedrock:*:*:application-inference-profile/*',
  ],
});

/**
 * Política para SES (Amazon Simple Email Service)
 */
export const sesPolicyStatement = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['ses:SendEmail', 'ses:SendRawEmail'],
  resources: ['*'],
});

/**
 * Política para S3 con bucket específico
 */
export const createS3PolicyStatement = (bucketArn: string) =>
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['s3:ListBucket', 's3:GetObject', 's3:PutObject', 's3:DeleteObject'],
    resources: [bucketArn, `${bucketArn}/*`],
  });

/**
 * Política para SQS - envío de mensajes
 */
export const createSqsSendPolicyStatement = (queueArns: string[]) =>
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['sqs:SendMessage', 'sqs:GetQueueAttributes'],
    resources: queueArns,
  });

/**
 * Política para SQS - recepción y procesamiento de mensajes
 */
export const createSqsReceivePolicyStatement = (queueArns: string[]) =>
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:ChangeMessageVisibility'],
    resources: queueArns,
  });

/**
 * Política para operaciones batch de DynamoDB
 */
export const createDynamoDbBatchPolicyStatement = (apiId: string) =>
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'dynamodb:BatchGetItem',
      'dynamodb:BatchWriteItem',
      'dynamodb:PutItem',
      'dynamodb:GetItem',
      'dynamodb:UpdateItem',
      'dynamodb:DeleteItem',
      'dynamodb:Query',
      'dynamodb:Scan',
    ],
    resources: [
      `arn:aws:dynamodb:*:*:table/Notification-${apiId}-*`,
      `arn:aws:dynamodb:*:*:table/Product-${apiId}-*`,
      `arn:aws:dynamodb:*:*:table/Order-${apiId}-*`,
      `arn:aws:dynamodb:*:*:table/CheckoutSession-${apiId}-*`,
    ],
  });
