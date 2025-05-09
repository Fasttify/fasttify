import { defineFunction } from '@aws-amplify/backend'

export const getStoreProducts = defineFunction({
  name: 'getStoreProducts',
  entry: 'handler.ts',
})
