import { useState, useCallback } from "react";
import { signIn, type SignInInput } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  clearError: () => void;
}

interface AuthError {
  code: string;
  message: string;
}

interface UseAuthProps {
  redirectPath?: string;
  onVerificationNeeded?: (email: string, password: string) => void;
}

export function useAuth({
  redirectPath = "/",
  onVerificationNeeded,
}: UseAuthProps = {}): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  const getErrorMessage = (error: AuthError): string => {
    switch (error.message) {
      case "Incorrect username or password.":
        return "Email o contraseña incorrectos";
      case "Password attempts exceeded":
        return "Demasiados intentos. Por favor, intenta más tarde";
      case "UserNotConfirmedException":
        return "Por favor confirma tu cuenta primero";
      case "NetworkError":
        return "Error de conexión. Por favor, verifica tu internet";
      default:
        return (
          error.message || "Ha ocurrido un error durante el inicio de sesión"
        );
    }
  };

  const clearError = useCallback(() => {
    setError(null);
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
          await router.push(redirectPath);
        } else if (onVerificationNeeded) {
          onVerificationNeeded(email, password);
        } else {
          setError("Se requiere verificación adicional");
        }
      } catch (err) {
        setError(getErrorMessage(err as AuthError));
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    },
    [router, redirectPath, onVerificationNeeded]
  );

  return {
    login,
    isLoading,
    error,
    isAuthenticated,
    clearError,
  };
}
