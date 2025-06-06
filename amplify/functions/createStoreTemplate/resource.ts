import { defineFunction } from '@aws-amplify/backend'

export const createStoreTemplate = defineFunction({
  timeoutSeconds: 120,
  name: 'create-store-template',
  entry: 'handler.ts',
})
