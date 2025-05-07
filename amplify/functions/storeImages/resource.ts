import { defineFunction, secret } from '@aws-amplify/backend'

export const storeImages = defineFunction({
  name: 'storeImages',
  entry: 'handler.ts',
  resourceGroupName: 'storeImages',
  environment: {
    BUCKET_NAME: secret('BUCKET_NAME'),
  },
})
