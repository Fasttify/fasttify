import { a } from '@aws-amplify/backend';

export const cartItemModel = a
  .model({
    cartId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]),
    cart: a.belongsTo('Cart', 'cartId'),
    store: a.belongsTo('UserStore', 'storeId'),
    productId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]),
    variantId: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]), // Para variantes del producto
    quantity: a
      .integer()
      .required()
      .default(1)
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read', 'update']),
      ]),
    unitPrice: a
      .float()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]),
    totalPrice: a
      .float()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read', 'update']),
      ]),
    productSnapshot: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]), // Snapshot del producto en el momento de agregarlo
    owner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]),
  })
  .secondaryIndexes((index) => [index('cartId'), index('productId'), index('storeId')])
  .authorization((allow) => [
    allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
  ]);
