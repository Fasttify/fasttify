import { defineFunction } from '@aws-amplify/backend';

export const checkStoreName = defineFunction({
  name: 'checkStoreName',
  entry: 'handler.ts',
});
