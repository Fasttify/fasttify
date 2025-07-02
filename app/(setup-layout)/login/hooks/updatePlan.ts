import { updateUserAttributes } from 'aws-amplify/auth';

export async function updateToPremiumPlan() {
  try {
    await updateUserAttributes({
      userAttributes: {
        'custom:plan': 'premium',
      },
    });
    return true;
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}
