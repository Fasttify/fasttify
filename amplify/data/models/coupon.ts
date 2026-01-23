import { a } from '@aws-amplify/backend';

export const couponModel = a
  .model({
    code: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),

    // Discount configuration (v1: solo percentage)
    discountType: a.enum(['percentage']),
    discountValue: a
      .float()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]), // Para percentage: 0-100

    // Constraints
    minimumPurchaseAmount: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),

    // Usage limits
    usageLimit: a
      .integer()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]), // null = unlimited
    usageLimitPerCustomer: a
      .integer()
      .default(1)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    currentUsageCount: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'update']),
      ]),

    // Date constraints
    startsAt: a
      .datetime()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    endsAt: a
      .datetime()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),

    // Product/collection constraints
    appliesToAllProducts: a
      .boolean()
      .default(true)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    productIds: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]), // Array de product IDs
    collectionIds: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]), // Array de collection IDs

    // Customer constraints
    firstTimeCustomersOnly: a
      .boolean()
      .default(false)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),

    // Status and metadata
    isActive: a
      .boolean()
      .default(true)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    title: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]), // Internal description
    description: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    currency: a
      .string()
      .default('COP')
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),

    // Authorization and relationships
    storeOwner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    store: a
      .belongsTo('UserStore', 'storeId')
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read']),
      ]),
    usages: a
      .hasMany('CouponUsage', 'couponId')
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]),
  })
  .secondaryIndexes((index) => [index('storeId'), index('code'), index('storeOwner')])
  .authorization((allow) => [
    allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey().to(['read']),
  ]);
