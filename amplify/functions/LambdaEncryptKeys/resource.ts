import { defineFunction, secret } from '@aws-amplify/backend';

export const apiKeyManager = defineFunction({
  name: 'apiKeyManager',
  entry: 'handler.ts',
  environment: {
    ENCRYPTION_KEY: secret('ENCRYPTION_KEY'),
  },
});
