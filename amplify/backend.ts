import { defineBackend } from '@aws-amplify/backend';
import { postConfirmation } from './auth/post-confirmation/resource';
import { customMessage } from './auth/custom-message/resource';
import { auth } from './auth/resource';
import {
  data,
  generateHaikuFunction,
  generatePriceSuggestionFunction,
  generateProductDescriptionFunction,
  createProduct,
} from './data/resource';
import { bulkEmailAPI, bulkEmailProcessor } from './functions/bulk-email/resource';
import { checkStoreDomain } from './functions/checkStoreDomain/resource';
import { createSubscription } from './functions/createSubscription/resource';
import { managePaymentKeys } from './functions/managePaymentKeys/resource';
import { planScheduler } from './functions/planScheduler/resource';
import { storeImages } from './functions/storeImages/resource';
import { webHookPlan } from './functions/webHookPlan/resource';
import { validateStoreLimits } from './functions/validateStoreLimits/resource';
import { websocketDevServer } from './functions/websocket-dev-server/resource';
import { storage } from './storage/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';

// Importaciones de configuración modular
import { createEmailQueues, configureEmailEventSources, configureEmailEnvironmentVariables } from './config/queues';
import { createRestApis } from './config/apis';
import { createWebSocketApi } from './config/websocket-api';
import {
  applyBedrockPermissions,
  applySesPermissions,
  applyS3Permissions,
  applySqsPermissions,
  applyApiAccessPolicies,
  applyDynamoDbPermissions,
} from './config/permissions';
import { createBackendOutputs } from './config/outputs';
// import { createPaymentKeysKmsKey } from './config/kms'; // PAUSADO - Descomentar cuando sea necesario

/**
 * Definición del backend con sus respectivos recursos.
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  createSubscription,
  webHookPlan,
  planScheduler,
  postConfirmation,
  customMessage,
  generateHaikuFunction,
  checkStoreDomain,
  generateProductDescriptionFunction,
  bulkEmailAPI,
  bulkEmailProcessor,
  generatePriceSuggestionFunction,
  storeImages,
  managePaymentKeys,
  createProduct,
  validateStoreLimits,
  websocketDevServer,
});

// Aplicar permisos de Bedrock para funciones de IA
applyBedrockPermissions(backend);

// Agregar permisos para la función createProduct
backend.createProduct.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    resources: ['*'],
    actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
  })
);

// Configuración KMS para claves de pago (PAUSADO)
// createPaymentKeysKmsKey(backend.stack, backend);
const { cfnResources } = backend.data.resources;
cfnResources.amplifyDynamoDbTables['Cart'].timeToLiveAttribute = {
  attributeName: 'ttl',
  enabled: true,
};

cfnResources.amplifyDynamoDbTables['CheckoutSession'].timeToLiveAttribute = {
  attributeName: 'ttl',
  enabled: true,
};

cfnResources.amplifyDynamoDbTables['WebSocketConnection'].timeToLiveAttribute = {
  attributeName: 'ttl',
  enabled: true,
};

// Configuración de colas SQS para email masivo
const { emailQueue, highPriorityEmailQueue } = createEmailQueues(backend.stack);

// Configurar event sources y variables de entorno para email
configureEmailEventSources(backend.bulkEmailProcessor, emailQueue, highPriorityEmailQueue);
configureEmailEnvironmentVariables(
  backend.bulkEmailAPI,
  backend.bulkEmailProcessor,
  emailQueue,
  highPriorityEmailQueue
);

// Aplicar permisos necesarios
applySesPermissions(backend);
applyS3Permissions(backend);
applySqsPermissions(backend, emailQueue.queueArn, highPriorityEmailQueue.queueArn);
applyDynamoDbPermissions(backend);

// Crear el stack para las APIs REST
const apiStack = backend.createStack('api-stack');

// Crear todas las APIs REST
const {
  subscriptionApi,
  webHookApi,
  checkStoreDomainApi,
  storeImagesApi,
  bulkEmailApi,
  storeLimitsApi,
  apiRestPolicy,
} = createRestApis(apiStack, backend);

// Aplicar políticas de acceso a las APIs
applyApiAccessPolicies(backend, apiRestPolicy);

// La función websocketDevServer ya está en el stack 'websocket-api-stack' por resourceGroupName
// Necesitamos crear la API WebSocket en el mismo stack
// Amplify crea el stack automáticamente cuando se usa resourceGroupName
// Accedemos al stack a través de la función Lambda
const webSocketStack = Stack.of(backend.websocketDevServer.resources.lambda);
const { webSocketApi, webSocketStage } = createWebSocketApi(
  webSocketStack,
  backend.websocketDevServer.resources.lambda,
  backend.data
);

/**
 * Salidas del Backend
 */
const backendOutputs = createBackendOutputs(
  subscriptionApi,
  webHookApi,
  checkStoreDomainApi,
  storeImagesApi,
  bulkEmailApi,
  storeLimitsApi,
  emailQueue,
  highPriorityEmailQueue,
  webSocketApi,
  webSocketStage
);

backend.addOutput({
  custom: backendOutputs,
});
