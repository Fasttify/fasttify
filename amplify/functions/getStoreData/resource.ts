import { defineFunction } from '@aws-amplify/backend'

export const getStoreData = defineFunction({
  name: 'getStoreData',
  entry: 'handler.ts',
})
