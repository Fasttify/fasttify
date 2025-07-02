import { signUp, confirmSignUp } from 'aws-amplify/auth';

export async function handleSignUp(email: string, password: string, nickName: string) {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          nickname: nickName,
        },
      },
    });

    return {
      isSignUpComplete,
      userId,
      nextStep,
    };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function handleConfirmSignUp(email: string, code: string) {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    return isSignUpComplete;
  } catch (error) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
}
