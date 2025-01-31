import { useState } from "react";
import { resetPassword } from "aws-amplify/auth";

interface UseResetPasswordReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  handleResetPassword: (email: string) => Promise<void>;
}

export const useResetPassword = (): UseResetPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Iniciamos el proceso de restablecimiento de contraseña
      await resetPassword({ username: email });

      setSuccess(true);
    } catch (err) {
      // Manejamos los diferentes tipos de errores
      if (err instanceof Error) {
        switch (err.name) {
          case "UserNotFoundException":
            setError(
              "No existe una cuenta asociada a este correo electrónico."
            );
            break;
          case "LimitExceededException":
            setError(
              "Has excedido el límite de intentos. Por favor, intenta más tarde."
            );
            break;
          case "InvalidParameterException":
            setError("Por favor, ingresa un correo electrónico válido.");
            break;
          default:
            setError(
              "Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente."
            );
        }
      } else {
        setError("Ocurrió un error inesperado. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    success,
    handleResetPassword,
  };
};
