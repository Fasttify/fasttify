import { a } from '@aws-amplify/backend';

export const collectionModel = a
  .model({
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
    description: a.string(),
    image: a.string(),
    slug: a.string(),
    isActive: a
      .boolean()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    sortOrder: a.integer(),
    owner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    products: a.hasMany('Product', 'collectionId'),
    store: a.belongsTo('UserStore', 'storeId'),
  })
  .secondaryIndexes((index) => [index('storeId'), index('title'), index('slug')])
  .authorization((allow) => [
    allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
    allow.publicApiKey().to(['read']),
  ]);
