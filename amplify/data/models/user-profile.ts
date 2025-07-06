import { a } from '@aws-amplify/backend';

export const userProfileModel = a
  .model({
    email: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('profileOwner').to(['create']),
        allow.publicApiKey().to(['read']),
      ]),
    profileOwner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('profileOwner').to(['create']),
        allow.publicApiKey().to(['read']),
      ]),
  })
  .authorization((allow) => [allow.ownerDefinedIn('profileOwner')]);
