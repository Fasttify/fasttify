import { defineFunction, secret } from '@aws-amplify/backend'

export const webHookPlan = defineFunction({
  name: 'hookPlan',
  entry: 'src/handler.ts',
  resourceGroupName: 'auth',
  environment: {
    MERCADOPAGO_ACCESS_TOKEN: secret('MERCADOPAGO_ACCESS_TOKEN'),
    MERCADO_PAGO_WEBHOOK_SECRET: secret('MERCADO_PAGO_WEBHOOK_SECRET'),
    USER_POOL_ID: secret('USER_POOL_ID'),
  },
})
