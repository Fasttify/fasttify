import { signUp, confirmSignUp } from 'aws-amplify/auth';

export async function handleSignUp(
  email: string,
  password: string,
  nickName: string,
  refreshUser?: () => Promise<void>
) {
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

    // Si el registro se completó automáticamente, refrescar el usuario
    if (isSignUpComplete && refreshUser) {
      await refreshUser();
    }

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

export async function handleConfirmSignUp(email: string, code: string, refreshUser?: () => Promise<void>) {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    // Si la confirmación fue exitosa, refrescar el usuario
    if (isSignUpComplete && refreshUser) {
      await refreshUser();
    }

    return isSignUpComplete;
  } catch (error) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
}
