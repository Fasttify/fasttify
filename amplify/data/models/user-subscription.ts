import { a } from '@aws-amplify/backend';

export const userSubscriptionModel = a
  .model({
    id: a
      .id()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
      ]),
    userId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'delete']),
      ]),
    subscriptionId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
      ]),
    planName: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
      ]),
    nextPaymentDate: a
      .datetime()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
      ]),
    pendingPlan: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
      ]),
    pendingStartDate: a
      .datetime()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
      ]),
    planPrice: a
      .float()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
      ]),
    lastFourDigits: a
      .integer()
      .authorization((allow) => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
      ]),
  })
  .identifier(['id'])
  .secondaryIndexes((index) => [index('userId'), index('subscriptionId'), index('pendingPlan')])
  .authorization((allow) => [
    allow.ownerDefinedIn('userId').to(['read', 'update', 'delete', 'create']),
    allow.authenticated().to(['create']),
    allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
  ]);
