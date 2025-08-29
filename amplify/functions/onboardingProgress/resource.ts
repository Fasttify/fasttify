import { defineFunction } from '@aws-amplify/backend';

export const onboardingProgress = defineFunction({
  timeoutSeconds: 30,
  name: 'onboarding-progress',
  entry: 'handler.ts',
  resourceGroupName: 'onboarding',
});
