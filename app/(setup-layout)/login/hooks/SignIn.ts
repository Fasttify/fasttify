import { useState, useCallback } from 'react';
import { signIn, resendSignUpCode, type SignInInput } from 'aws-amplify/auth';

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

export function useAuth({ redirectPath = '/', onVerificationNeeded }: UseAuthProps = {}): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getErrorMessage = (error: AuthError): string => {
    switch (error.message) {
      case 'Incorrect username or password.':
        return 'Email o contraseña incorrectos';
      case 'Password attempts exceeded':
        return 'Demasiados intentos. Por favor, intenta más tarde';
      case 'UserNotConfirmedException':
        return 'Por favor confirma tu cuenta primero';
      case 'Attempt limit exceeded, please try after some time.':
        return 'Número de intentos excedido. Intenta más tarde';
      case 'NetworkError':
        return 'Error de conexión. Por favor, verifica tu internet';
      case 'There is already a signed in user.':
        return 'Ya hay un usuario autenticado. Por favor, cierra la sesión primero';
      default:
        return error.message || 'Ha ocurrido un error durante el inicio de sesión';
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Nueva función para reenviar el código de confirmación
  const resendConfirmationCode = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await resendSignUpCode({ username: email });

      setError('Se ha reenviado el código de verificación. Por favor, revisa tu correo.');
    } catch (err) {
      console.error('[Auth] Error resending confirmation code:', err);
      setError(getErrorMessage(err as AuthError));
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
          setIsAuthenticated(true);
          // Reemplazar router.push con window.location.href
          window.location.href = redirectPath;
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
        setError(getErrorMessage(err as AuthError));
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    },
    [redirectPath, onVerificationNeeded, resendConfirmationCode]
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
