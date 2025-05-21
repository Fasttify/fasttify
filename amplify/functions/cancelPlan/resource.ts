import { defineFunction, secret } from '@aws-amplify/backend'

export const cancelPlan = defineFunction({
  name: 'cancelPlan',
  entry: 'handler.ts',
  environment: {
    MERCADOPAGO_ACCESS_TOKEN: secret('MERCADOPAGO_ACCESS_TOKEN'),
  },
})
