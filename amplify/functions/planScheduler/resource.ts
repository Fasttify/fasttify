import { defineFunction, secret } from "@aws-amplify/backend";

export const planScheduler = defineFunction({
  name: "planScheduler",
  entry: "handler.ts",
  resourceGroupName: "auth",
  schedule: "every day",
  environment: {
    USER_POOL_ID: secret("USER_POOL_ID"),
  },
});
