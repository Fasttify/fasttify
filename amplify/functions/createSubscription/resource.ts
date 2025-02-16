import { defineFunction, secret } from '@aws-amplify/backend'

export const createSubscription = defineFunction({
  name: 'createSubscription',
  entry: 'handler.ts',
  environment: {
    MERCADOPAGO_ACCESS_TOKEN: secret('MERCADOPAGO_ACCESS_TOKEN'),
  },
})
