import { a } from '@aws-amplify/backend';

export const checkoutSessionModel = a
  .model({
    token: a
      .string()
      .required()
      .authorization((allow) => [
        allow.publicApiKey().to(['read', 'create']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    cartId: a
      .string()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    sessionId: a
      .string()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    status: a.enum(['open', 'completed', 'expired', 'cancelled']),
    expiresAt: a
      .datetime()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    currency: a
      .string()
      .default('COP')
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    subtotal: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    shippingCost: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'update']),
      ]),
    taxAmount: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read', 'update']),
      ]),
    totalAmount: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    itemsSnapshot: a
      .json()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    customerInfo: a
      .json()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    shippingAddress: a
      .json()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    billingAddress: a
      .json()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    notes: a
      .string()
      .authorization((allow) => [
        allow.publicApiKey().to(['create', 'read', 'update']),
        allow.ownerDefinedIn('storeOwner').to(['read']),
      ]),
    storeOwner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
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
    allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update']),
  ]);
