import { useState } from 'react';
import { updatePassword, resetPassword, confirmResetPassword } from 'aws-amplify/auth';

// Tipo para los detalles de entrega del código en el reset de contraseña.
export interface CodeDeliveryDetails {
  deliveryMedium: string;
  destination: string;
}

// Tipo para el siguiente paso en el proceso de reset de contraseña.
export type ResetPasswordNextStep = {
  resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE' | 'DONE';
  codeDeliveryDetails?: CodeDeliveryDetails;
};

const usePasswordManagement = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [codeDeliveryDetails, setCodeDeliveryDetails] = useState<CodeDeliveryDetails | null>(null);

  /**
   * Actualiza la contraseña de un usuario autenticado.
   *
   * @param oldPassword - Contraseña actual del usuario.
   * @param newPassword - Nueva contraseña a establecer.
   */
  const updateUserPassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await updatePassword({ oldPassword, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicia el proceso de reinicio de contraseña enviando un código de confirmación.
   *
   * @param username - El identificador del usuario (por ejemplo, email).
   * @returns Información sobre el siguiente paso y detalles de entrega del código.
   */
  const resetUserPassword = async (username: string): Promise<ResetPasswordNextStep> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const output = await resetPassword({ username });
      const { nextStep } = output;

      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE' && nextStep.codeDeliveryDetails) {
        setCodeDeliveryDetails(nextStep.codeDeliveryDetails as any);
      } else if (nextStep.resetPasswordStep === 'DONE') {
        setSuccess(true);
      }

      return nextStep as ResetPasswordNextStep;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Completa el proceso de reinicio de contraseña confirmando el código enviado y estableciendo una nueva contraseña.
   *
   * @param username - El identificador del usuario (por ejemplo, email).
   * @param confirmationCode - El código de confirmación recibido.
   * @param newPassword - La nueva contraseña a establecer.
   */
  const confirmUserPasswordReset = async (
    username: string,
    confirmationCode: string,
    newPassword: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await confirmResetPassword({ username, confirmationCode, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUserPassword,
    resetUserPassword,
    confirmUserPasswordReset,
    loading,
    error,
    success,
    codeDeliveryDetails,
  };
};

export default usePasswordManagement;
