import { a } from '@aws-amplify/backend';

export const userSubscriptionModel = a
  .model({
    id: a
      .id()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete'])]),
    userId: a
      .string()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('userId').to(['create', 'read', 'delete'])]),
    subscriptionId: a
      .string()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete'])]),
    planName: a
      .string()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete'])]),
    nextPaymentDate: a.datetime(),
    pendingPlan: a.string(),
    pendingStartDate: a.datetime(),
    planPrice: a.float(),
    lastFourDigits: a.integer(),
  })
  .identifier(['id'])
  .secondaryIndexes((index) => [index('userId'), index('subscriptionId'), index('pendingPlan')])
  .authorization((allow) => [
    allow.ownerDefinedIn('userId').to(['read', 'update', 'delete', 'create']),
    allow.authenticated().to(['create']),
  ]);
