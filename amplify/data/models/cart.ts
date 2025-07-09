import { a, type ClientSchema } from '@aws-amplify/backend';

export const cartModel = a
  .model({
    userId: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]), // Para usuarios registrados
    sessionId: a.string().authorization((allow) => [allow.publicApiKey().to(['create', 'read', 'update'])]), // Para usuarios invitados
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]),
    items: a.hasMany('CartItem', 'cartId'),
    totalAmount: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['read', 'update']),
        allow.publicApiKey().to(['read', 'update']),
      ]),
    itemCount: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['read', 'update']),
        allow.publicApiKey().to(['read', 'update']),
      ]),
    currency: a
      .string()
      .default('COP')
      .authorization((allow) => [allow.ownerDefinedIn('userId').to(['read']), allow.publicApiKey().to(['read'])]),
    expiresAt: a
      .datetime()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['read']),
        allow.publicApiKey().to(['read', 'update']),
      ]), // Para limpiar carritos abandonados
    store: a.belongsTo('UserStore', 'storeId'),
  })
  .secondaryIndexes((index) => [index('userId'), index('sessionId'), index('storeId'), index('expiresAt')])
  .authorization((allow) => [
    allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey().to(['read', 'create', 'update']),
  ]);
