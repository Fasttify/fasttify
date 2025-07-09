import { a } from '@aws-amplify/backend';

export const navigationMenuModel = a
  .model({
    id: a
      .id()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    domain: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    name: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    handle: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    isMain: a
      .boolean()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    isActive: a
      .boolean()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    menuData: a
      .json()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    owner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    store: a.belongsTo('UserStore', 'storeId'),
  })
  .secondaryIndexes((index) => [index('storeId'), index('handle'), index('domain')])
  .authorization((allow) => [
    allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
    allow.publicApiKey().to(['read']),
  ]);
