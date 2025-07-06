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
    storeBanner: a.string(),
    storeTheme: a.string(),
    storeCurrency: a.string(),
    storeType: a.string(),
    storeStatus: a.boolean(),
    storePolicy: a.string(),
    storeAdress: a.string(),
    contactEmail: a.string(),
    contactPhone: a.string(),
    contactName: a.string(),
    conctactIdentification: a.string(),
    contactIdentificationType: a.string(),
    wompiConfig: a.json(),
    mercadoPagoConfig: a.json(),
    mastershopApiKey: a.string(),
    customDomain: a.string(),
    customDomainStatus: a.string(),
    customDomainVerifiedAt: a.datetime(),
    cloudFrontTenantId: a.string(),
    cloudFrontEndpoint: a.string(),
    onboardingCompleted: a
      .boolean()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.authenticated().to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read']),
      ]),
    onboardingData: a.json(),
  })
  .identifier(['storeId'])
  .secondaryIndexes((index) => [index('userId'), index('customDomain'), index('storeName')])
  .authorization((allow) => [
    allow.authenticated().to(['read', 'update', 'delete', 'create']),
    allow.publicApiKey().to(['read']),
    allow.ownerDefinedIn('userId').to(['read', 'update', 'delete', 'create']),
  ]);
