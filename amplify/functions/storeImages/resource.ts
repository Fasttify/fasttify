import { defineFunction, secret } from '@aws-amplify/backend';

export const storeImages = defineFunction({
  name: 'storeImages',
  entry: 'handler.ts',
  timeoutSeconds: 60,
  memoryMB: 1024,
  resourceGroupName: 'store-management',
  environment: {
    BUCKET_NAME: secret('BUCKET_NAME'),
    AWS_REGION_BUCKET: secret('AWS_REGION_BUCKET'),
    CLOUDFRONT_DOMAIN_NAME: secret('CLOUDFRONT_DOMAIN_NAME'),
    APP_ENV: secret('APP_ENV'),
  },
});
