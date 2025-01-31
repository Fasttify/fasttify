import { defineFunction } from "@aws-amplify/backend";

export const webHookPlan = defineFunction({
  name: "hookPlan",
  entry: "src/handler.ts",
  resourceGroupName: "auth",
});
