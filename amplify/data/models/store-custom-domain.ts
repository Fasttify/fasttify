import { a } from '@aws-amplify/backend';

export const storeCustomDomainModel = a
  .model({
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'delete']),
        allow.authenticated().to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read']),
      ]),
    customDomain: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
        allow.authenticated().to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read']),
      ]),
    customDomainStatus: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
        allow.authenticated().to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read']),
      ]),
    customDomainVerifiedAt: a
      .datetime()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
        allow.authenticated().to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read']),
      ]),
    cloudFrontTenantId: a
      .string()
      .authorization((allow) => [
        allow.authenticated().to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read']),
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
      ]),
    cloudFrontEndpoint: a
      .string()
      .authorization((allow) => [
        allow.authenticated().to(['create', 'read', 'update']),
        allow.publicApiKey().to(['read']),
        allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
      ]),
    store: a.belongsTo('UserStore', 'storeId'),
  })
  .identifier(['storeId'])
  .secondaryIndexes((index) => [index('customDomain'), index('cloudFrontTenantId'), index('cloudFrontEndpoint')])
  .authorization((allow) => [
    allow.ownerDefinedIn('storeId').to(['create', 'read', 'update', 'delete']),
    allow.authenticated().to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey().to(['read']),
  ]);
