import { defineFunction, secret } from '@aws-amplify/backend';

export const createSubscription = defineFunction({
  name: 'createSubscription',
  entry: 'handler.ts',
  environment: {
    POLAR_ACCESS_TOKEN: secret('POLAR_ACCESS_TOKEN'),
    POLAR_ORGANIZATION_ID: secret('POLAR_ORGANIZATION_ID'),
  },
});
