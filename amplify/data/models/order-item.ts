import { a } from '@aws-amplify/backend';

export const orderItemModel = a
  .model({
    orderId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    order: a.belongsTo('Order', 'orderId'),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    store: a.belongsTo('UserStore', 'storeId'),
    productId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    variantId: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    quantity: a
      .integer()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    unitPrice: a
      .float()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    totalPrice: a
      .float()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    compareAtPrice: a
      .float()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]), // Precio de comparación (descuento)
    productSnapshot: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]), // Snapshot completo del producto
    storeOwner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
  })
  .secondaryIndexes((index) => [index('orderId'), index('productId'), index('storeId')])
  .authorization((allow) => [
    allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
    allow.publicApiKey().to(['create', 'read']),
  ]);
