import { defineFunction } from '@aws-amplify/backend';

export const checkStoreDomain = defineFunction({
  name: 'checkStoreDomain',
  entry: 'handler.ts',
  resourceGroupName: 'store-management',
});
