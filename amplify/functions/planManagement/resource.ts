import { defineFunction, secret } from '@aws-amplify/backend'

export const planManagement = defineFunction({
  name: 'planManagement',
  entry: 'src/handler.ts',
  environment: {
    MERCADOPAGO_ACCESS_TOKEN: secret('MERCADOPAGO_ACCESS_TOKEN'),
  },
})
