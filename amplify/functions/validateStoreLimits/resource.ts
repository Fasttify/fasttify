import { defineFunction, secret } from '@aws-amplify/backend';

export const validateStoreLimits = defineFunction({
  name: 'validate-store-limits',
  entry: 'handler.ts',
  timeoutSeconds: 20,
  memoryMB: 1024,
  runtime: 20,
  environment: {
    USER_POOL_ID: secret('USER_POOL_ID'),
  },
});
