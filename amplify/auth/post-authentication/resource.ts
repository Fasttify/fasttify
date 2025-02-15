import { defineFunction } from '@aws-amplify/backend'

export const postAuthentication = defineFunction({
  name: 'post-authentication',
  resourceGroupName: 'auth',
})
