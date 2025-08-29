import { defineFunction } from '@aws-amplify/backend';

export const postConfirmation = defineFunction({
  timeoutSeconds: 120,
  name: 'post-confirmation',
  resourceGroupName: 'auth',
});
