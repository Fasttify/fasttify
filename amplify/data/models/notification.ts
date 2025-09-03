import { a } from '@aws-amplify/backend';

export const notificationModel = a
  .model({
    id: a
      .id()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    type: a.enum(['new_order', 'payment_confirmed', 'status_updated', 'system_alert']),
    title: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    message: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    orderId: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    orderNumber: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    totalAmount: a
      .float()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    currency: a
      .string()
      .default('COP')
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    customerEmail: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    read: a
      .boolean()
      .default(false)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    priority: a.enum(['low', 'medium', 'high', 'urgent']),
    metadata: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]), // Para datos adicionales como tracking number, etc.
    storeOwner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    store: a
      .belongsTo('UserStore', 'storeId')
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    order: a
      .belongsTo('Order', 'orderId')
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
  })
  .secondaryIndexes((index) => [index('storeId'), index('storeOwner'), index('type'), index('priority')])
  .authorization((allow) => [
    allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey().to(['create', 'read']),
  ]);
