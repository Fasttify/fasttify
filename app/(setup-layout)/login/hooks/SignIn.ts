import { resendSignUpCode, signIn, type SignInInput } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useAuth } from '@/context/hooks/useAuth';
import { getSignInErrorMessage } from '@/lib/auth-error-messages';
import { getLastVisitedStoreClient } from '@/lib/cookies/last-store';

interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  clearError: () => void;
  resendConfirmationCode: (email: string) => Promise<void>;
}

interface AuthError {
  code: string;
  message: string;
}

interface UseAuthProps {
  redirectPath?: string;
  onVerificationNeeded?: (email: string, password: string) => void;
}

export function useSignIn({ redirectPath, onVerificationNeeded }: UseAuthProps = {}): UseAuthReturn {
  const router = useRouter();
  const { refreshUser, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Determines the appropriate redirect path after successful login
   * Checks for last visited store or defaults to store selection
   *
   * @returns The redirect path to use
   */
  const getRedirectPath = useCallback((): string => {
    // If a specific redirect path is provided, use it
    if (redirectPath) {
      return redirectPath;
    }

    // Check for last visited store in client-side cookies
    const lastStoreId = getLastVisitedStoreClient();

    if (lastStoreId) {
      return `/store/${lastStoreId}/home`;
    }

    // Default to store selection page
    return '/my-store';
  }, [redirectPath]);

  /**
   * Resends confirmation code for email verification
   *
   * @param email - The email address to resend confirmation code to
   */
  const resendConfirmationCode = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await resendSignUpCode({ username: email });

      setError('Se ha reenviado el código de verificación. Por favor, revisa tu correo.');
    } catch (err) {
      console.error('[Auth] Error resending confirmation code:', err);
      setError(getSignInErrorMessage(err as AuthError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const signInInput: SignInInput = {
          username: email,
          password,
        };

        const { isSignedIn, nextStep } = await signIn(signInInput);

        if (isSignedIn) {
          // Refrescar el estado del usuario en el store global
          await refreshUser();
          // Use the smart redirect path instead of the hardcoded one
          router.push(getRedirectPath());
        } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
          // Si el usuario no ha confirmado su registro, reenvía el código
          await resendConfirmationCode(email);
          // Redirige al usuario a la interfaz de verificación
          if (onVerificationNeeded) {
            onVerificationNeeded(email, password);
          }
        } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
          // Si se requiere un código de verificación adicional
          if (onVerificationNeeded) {
            onVerificationNeeded(email, password);
          } else {
            setError('Se requiere verificación adicional');
          }
        } else {
          setError('Se requiere una acción adicional para completar el inicio de sesión');
        }
      } catch (err) {
        setError(getSignInErrorMessage(err as AuthError));
      } finally {
        setIsLoading(false);
      }
    },
    [onVerificationNeeded, resendConfirmationCode, router, refreshUser, getRedirectPath]
  );

  return {
    login,
    isLoading,
    error,
    isAuthenticated,
    clearError,
    resendConfirmationCode,
  };
}
