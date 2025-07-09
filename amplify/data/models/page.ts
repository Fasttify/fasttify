import { a } from '@aws-amplify/backend';

export const pageModel = a
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
    title: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    content: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    slug: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    metaTitle: a.string(),
    metaDescription: a.string(),
    status: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    isVisible: a
      .boolean()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    template: a.string(),
    pageType: a
      .string()
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
  .secondaryIndexes((index) => [index('storeId'), index('slug'), index('status'), index('pageType')])
  .authorization((allow) => [
    allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
    allow.publicApiKey().to(['read']),
  ]);
