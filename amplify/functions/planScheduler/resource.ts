import { defineFunction, secret } from '@aws-amplify/backend';

export const planScheduler = defineFunction({
  timeoutSeconds: 120,
  name: 'planScheduler',
  entry: 'handler.ts',
  resourceGroupName: 'auth',
  schedule: 'every 1h',
  environment: {
    USER_POOL_ID: secret('USER_POOL_ID'),
  },
});
