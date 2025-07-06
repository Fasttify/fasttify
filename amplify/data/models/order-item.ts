import { a } from '@aws-amplify/backend';

export const orderItemModel = a
  .model({
    orderId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    order: a.belongsTo('Order', 'orderId'),
    productId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    variantId: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    quantity: a
      .integer()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    unitPrice: a
      .float()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    totalPrice: a
      .float()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    productSnapshot: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]), // Snapshot completo del producto
    storeOwner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
  })
  .secondaryIndexes((index) => [index('orderId'), index('productId')])
  .authorization((allow) => [
    allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
    allow.publicApiKey().to(['create', 'read']),
  ]);
