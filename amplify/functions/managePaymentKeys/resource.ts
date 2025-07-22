import { defineFunction, secret } from '@aws-amplify/backend';

export const managePaymentKeys = defineFunction({
  name: 'managePaymentKeys',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    KMS_KEY_ALIAS: secret('KMS_KEY_ALIAS'),
  },
});
