import { a } from '@aws-amplify/backend';

export const userStoreModel = a
  .model({
    userId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'delete']),
        allow.authenticated().to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.authenticated().to(['create', 'read']),
        allow.publicApiKey().to(['read']),
      ]),
    storeName: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.authenticated().to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read']),
      ]),
    storeDescription: a.string(),
    storeLogo: a.string(),
    storeFavicon: a.string(),
    storeTheme: a.string(),
    storeCurrency: a.string(),
    storeType: a.string(),
    storeStatus: a.boolean(),
    storeAdress: a.string(),
    contactEmail: a.string(),
    contactPhone: a.string(),
    contactName: a.string(),
    conctactIdentification: a.string(),
    contactIdentificationType: a.string(),
    defaultDomain: a.string(),
    onboardingCompleted: a
      .boolean()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.authenticated().to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read']),
      ]),
    onboardingData: a.json(),
    products: a.hasMany('Product', 'storeId'),
    collections: a.hasMany('Collection', 'storeId'),
    carts: a.hasMany('Cart', 'storeId'),
    cartItems: a.hasMany('CartItem', 'storeId'),
    orders: a.hasMany('Order', 'storeId'),
    orderItems: a.hasMany('OrderItem', 'storeId'),
    pages: a.hasMany('Page', 'storeId'),
    navigationMenus: a.hasMany('NavigationMenu', 'storeId'),
    storePaymentConfig: a.hasMany('StorePaymentConfig', 'storeId'),
    storeCustomDomain: a.hasOne('StoreCustomDomain', 'storeId'),
  })
  .identifier(['storeId'])
  .secondaryIndexes((index) => [index('userId'), index('storeName'), index('defaultDomain')])
  .authorization((allow) => [
    allow.authenticated().to(['read', 'update', 'delete', 'create']),
    allow.publicApiKey().to(['read']),
    allow.ownerDefinedIn('userId').to(['read', 'update', 'delete', 'create']),
  ]);
