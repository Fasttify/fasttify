import { a } from '@aws-amplify/backend';

export const userThemeModel = a
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
    name: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    version: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    author: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    description: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    s3Key: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    cdnUrl: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    fileCount: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    totalSize: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    isActive: a
      .boolean()
      .default(false)
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    settings: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    validation: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    analysis: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    preview: a
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
  .secondaryIndexes((index) => [index('storeId'), index('name'), index('owner')])
  .authorization((allow) => [
    allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey().to(['read']),
  ]);
