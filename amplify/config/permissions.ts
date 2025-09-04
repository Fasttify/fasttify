/**
 * Configuración y aplicación de permisos IAM para las funciones Lambda
 */

import {
  bedrockPolicyStatement,
  sesPolicyStatement,
  createS3PolicyStatement,
  createSqsSendPolicyStatement,
  createSqsReceivePolicyStatement,
  createDynamoDbBatchPolicyStatement,
} from './policies';

/**
 * Aplica permisos de Bedrock a las funciones de IA
 */
export function applyBedrockPermissions(backend: any): void {
  backend.generateHaikuFunction.resources.lambda.addToRolePolicy(bedrockPolicyStatement);
  backend.generateProductDescriptionFunction.resources.lambda.addToRolePolicy(bedrockPolicyStatement);
  backend.generatePriceSuggestionFunction.resources.lambda.addToRolePolicy(bedrockPolicyStatement);
}

/**
 * Aplica permisos de SES para envío de emails
 */
export function applySesPermissions(backend: any): void {
  backend.postConfirmation.resources.lambda.addToRolePolicy(sesPolicyStatement);
  backend.bulkEmailAPI.resources.lambda.addToRolePolicy(sesPolicyStatement);
  backend.bulkEmailProcessor.resources.lambda.addToRolePolicy(sesPolicyStatement);
}

/**
 * Aplica permisos de S3 para manejo de imágenes
 */
export function applyS3Permissions(backend: any): void {
  const s3PolicyStatement = createS3PolicyStatement(backend.storage.resources.bucket.bucketArn);
  backend.storeImages.resources.lambda.addToRolePolicy(s3PolicyStatement);
}

/**
 * Aplica permisos de SQS para el sistema de emails
 */
export function applySqsPermissions(backend: any, emailQueueArn: string, highPriorityQueueArn: string): void {
  const queueArns = [emailQueueArn, highPriorityQueueArn];

  // Permisos para enviar mensajes a las colas
  const sqsSendPolicy = createSqsSendPolicyStatement(queueArns);
  backend.bulkEmailAPI.resources.lambda.addToRolePolicy(sqsSendPolicy);

  // Permisos para recibir y procesar mensajes de las colas
  const sqsReceivePolicy = createSqsReceivePolicyStatement(queueArns);
  backend.bulkEmailProcessor.resources.lambda.addToRolePolicy(sqsReceivePolicy);
}

/**
 * Aplica políticas de acceso a las APIs REST
 */
export function applyApiAccessPolicies(backend: any, apiRestPolicy: any): void {
  // Adjuntar la política a los roles autenticados y no autenticados
  backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(apiRestPolicy);
  backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(apiRestPolicy);
}

/**
 * Aplica permisos de DynamoDB para custom handlers de AppSync
 */
export function applyDynamoDbPermissions(backend: any): void {
  // Obtener el rol de AppSync
  const appSyncRole = backend.data.resources.cfnResources.amplifyDynamoDbTablesRole;

  if (appSyncRole) {
    // Crear y aplicar la política de DynamoDB
    const dynamoDbPolicy = createDynamoDbBatchPolicyStatement(backend.data.resources.cfnResources.awsAppsyncApiId);
    appSyncRole.addToPolicy(dynamoDbPolicy);
  }
}
