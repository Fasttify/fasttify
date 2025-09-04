import { a } from '@aws-amplify/backend';

export const notificationReturnModel = a.customType({
  id: a.string().required(),
  read: a.boolean(),
  updatedAt: a.string(),
});
