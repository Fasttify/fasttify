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
import { storage } from './storage/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

// Importaciones de configuración modular
import { createEmailQueues, configureEmailEventSources, configureEmailEnvironmentVariables } from './config/queues';
import { createRestApis } from './config/apis';
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

// Crear el stack para las APIs
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
  highPriorityEmailQueue
);

backend.addOutput({
  custom: backendOutputs,
});
