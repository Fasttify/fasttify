import { defineFunction, secret } from '@aws-amplify/backend';

export const webHookPlan = defineFunction({
  name: 'hookPlan',
  entry: 'handler.ts',
  resourceGroupName: 'auth',
  environment: {
    POLAR_ACCESS_TOKEN: secret('POLAR_ACCESS_TOKEN'),
    POLAR_WEBHOOK_SECRET: secret('POLAR_WEBHOOK_SECRET'),
    USER_POOL_ID: secret('USER_POOL_ID'),
  },
});
