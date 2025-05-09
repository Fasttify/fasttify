import { defineFunction } from '@aws-amplify/backend'

export const postAuthentication = defineFunction({
  timeoutSeconds: 120,
  name: 'post-authentication',
  resourceGroupName: 'auth',
})
