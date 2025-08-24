import { a } from '@aws-amplify/backend';

export const checkoutSessionModel = a
  .model({
    token: a
      .string()
      .required()
      .authorization((allow) => [
        allow.publicApiKey().to(['read', 'create']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    cartId: a
      .string()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    sessionId: a
      .string()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    status: a.enum(['open', 'completed', 'expired', 'cancelled']),
    expiresAt: a
      .datetime()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    currency: a
      .string()
      .default('COP')
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    subtotal: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    shippingCost: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'update', 'delete', 'create']),
      ]),
    taxAmount: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'update', 'delete', 'create']),
      ]),
    totalAmount: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    itemsSnapshot: a
      .json()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    customerInfo: a
      .json()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    shippingAddress: a
      .json()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    billingAddress: a
      .json()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    notes: a
      .string()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'create', 'update', 'delete']),
      ]),
    storeOwner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    store: a.belongsTo('UserStore', 'storeId'),
  })
  .secondaryIndexes((index) => [
    index('token'),
    index('storeId'),
    index('sessionId'),
    index('status'),
    index('storeOwner'),
    index('expiresAt'),
  ])
  .authorization((allow) => [
    allow.publicApiKey().to(['create', 'read', 'update']),
    allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
  ]);
