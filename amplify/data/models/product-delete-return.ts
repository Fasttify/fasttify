import { a } from '@aws-amplify/backend';

export const productDeleteReturnModel = a.customType({
  id: a.string().required(),
  deleted: a.boolean(),
  deletedAt: a.string(),
});
