import { defineFunction } from "@aws-amplify/backend";

export const createSubscription = defineFunction({
  name: "createSubscription",
  entry: "src/handler.ts",
});
