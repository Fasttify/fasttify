import { a } from '@aws-amplify/backend';

export const productModel = a
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
    description: a.string(),
    price: a.float(),
    compareAtPrice: a.float(),
    costPerItem: a.float(),
    sku: a.string(),
    barcode: a.string(),
    quantity: a.integer(),
    category: a.string(),
    images: a.json(),
    attributes: a.json(),
    status: a.string(),
    slug: a.string(),
    featured: a.boolean(),
    tags: a.json(),
    variants: a.json(),
    collectionId: a.string(),
    supplier: a.string(),
    collection: a.belongsTo('Collection', 'collectionId'),
    store: a.belongsTo('UserStore', 'storeId'),
    owner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
  })
  .secondaryIndexes((index) => [index('storeId'), index('collectionId')])
  .authorization((allow) => [
    allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
    allow.publicApiKey().to(['read']),
  ]);
