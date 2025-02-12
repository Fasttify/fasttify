import { defineFunction } from "@aws-amplify/backend";

export const planScheduler = defineFunction({
  name: "planScheduler",
  entry: "handler.ts",
  resourceGroupName: "auth",
  schedule: "every 1h",
});
