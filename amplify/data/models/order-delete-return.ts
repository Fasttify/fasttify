import { a } from '@aws-amplify/backend';

export const orderDeleteReturnModel = a.customType({
  id: a.string().required(),
  deleted: a.boolean(),
  deletedAt: a.string(),
});
