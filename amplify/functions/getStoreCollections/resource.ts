import { defineFunction } from '@aws-amplify/backend'

export const getStoreCollections = defineFunction({
  name: 'getStoreCollections',
  entry: 'handler.ts',
})
