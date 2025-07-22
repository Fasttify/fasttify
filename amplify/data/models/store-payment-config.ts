import { a } from '@aws-amplify/backend';

export const storePaymentConfigModel = a
  .model({
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['read']),
        allow.authenticated().to(['read']),
      ]),
    gatewayType: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
        allow.authenticated().to(['read']),
      ]),
    publicKeyEncrypted: a
      .string()
      .required()
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
        allow.authenticated().to(['read']),
      ]),
    privateKeyEncrypted: a
      .string()
      .required()
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
        allow.authenticated().to(['read']),
      ]),
    isActive: a
      .boolean()
      .default(false)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
        allow.authenticated().to(['read']),
      ]),
    store: a.belongsTo('UserStore', 'storeId'),
  })
  .identifier(['storeId', 'gatewayType'])
  .secondaryIndexes((index) => [index('storeId'), index('gatewayType')])
  .authorization((allow) => [
    allow.ownerDefinedIn('storeId').to(['read', 'update']),
    allow.authenticated().to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey().to(['read']),
  ]);
