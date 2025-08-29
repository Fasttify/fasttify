import { defineFunction, secret } from '@aws-amplify/backend';

export const bulkEmailProcessor = defineFunction({
  name: 'bulk-email-processor',
  entry: 'handler.ts',
  resourceGroupName: 'email-system',
  timeoutSeconds: 900, // 15 minutos para procesamiento de lotes grandes
  memoryMB: 1024,
  environment: {
    SES_FROM_EMAIL: secret('SES_FROM_EMAIL'),
    SES_REPLY_TO_EMAIL: secret('SES_REPLY_TO_EMAIL'),
    EMAIL_BATCH_SIZE: '10',
    MAX_RETRIES: '3',
    RATE_LIMIT_PER_SECOND: '14',
    EMAIL_QUEUE_URL: 'placeholder',
    HIGH_PRIORITY_QUEUE_URL: 'placeholder',
  },
});

export const bulkEmailAPI = defineFunction({
  name: 'bulk-email-api',
  entry: 'api.ts',
  resourceGroupName: 'email-system',
  timeoutSeconds: 30,
  memoryMB: 512,
  environment: {
    SES_FROM_EMAIL: secret('SES_FROM_EMAIL'),
    EMAIL_BATCH_SIZE: '10',
    EMAIL_QUEUE_URL: 'placeholder',
    HIGH_PRIORITY_QUEUE_URL: 'placeholder',
  },
});
