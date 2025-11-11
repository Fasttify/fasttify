import { defineFunction, secret } from '@aws-amplify/backend';

export const websocketDevServer = defineFunction({
  name: 'websocketDevServer',
  entry: 'handler.ts',
  resourceGroupName: 'websocket-api-stack',
  environment: {
    WEBSOCKET_API_ENDPOINT: secret('WEBSOCKET_API_ENDPOINT'),
  },
});
