import { Modal, TextField, FormLayout, Banner, Text } from '@shopify/polaris';
import { useState, useEffect } from 'react';
import { updateUserAttributes, confirmUserAttribute } from 'aws-amplify/auth';
import { forgotPasswordSchema, verificationSchema } from '@/lib/zod-schemas/schemas';

interface ChangeEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

/**
 * Diálogo modal para cambiar el email del usuario usando Shopify Polaris
 * Incluye verificación por código de confirmación
 *
 * @component
 * @param {ChangeEmailDialogProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal con formulario de cambio de email
 */
export function ChangeEmailDialog({ isOpen, onClose, currentEmail }: ChangeEmailDialogProps) {
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Valida el formato del email usando Zod schema
   *
   * @param {string} email - Email a validar
   * @returns {string | undefined} Mensaje de error si es inválido
   */
  const validateEmail = (email: string): string | undefined => {
    try {
      forgotPasswordSchema.parse({ email });

      // Validación adicional: no usar el mismo email actual
      if (email.toLowerCase() === currentEmail.toLowerCase()) {
        return 'No puedes usar tu mismo email actual';
      }

      return undefined;
    } catch (error: any) {
      if (error.errors) {
        return error.errors[0]?.message || 'Email inválido';
      }
      return 'Email inválido';
    }
  };

  /**
   * Valida el código de verificación usando Zod schema
   *
   * @param {string} code - Código a validar
   * @returns {string | undefined} Mensaje de error si es inválido
   */
  const validateVerificationCode = (code: string): string | undefined => {
    try {
      verificationSchema.parse({ code });
      return undefined;
    } catch (error: any) {
      if (error.errors) {
        return error.errors[0]?.message || 'Código inválido';
      }
      return 'Código inválido';
    }
  };

  /**
   * Maneja el envío del nuevo email
   */
  const handleSubmitEmail = async () => {
    const emailError = validateEmail(newEmail);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateUserAttributes({
        userAttributes: {
          email: newEmail,
        },
      });

      setRequiresVerification(true);
    } catch (err: any) {
      console.error('Error updating email:', err);
      setError(err.message || 'Error al actualizar el email');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la verificación del código
   */
  const handleSubmitVerification = async () => {
    const codeError = validateVerificationCode(verificationCode);
    if (codeError) {
      setError(codeError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await confirmUserAttribute({
        userAttributeKey: 'email',
        confirmationCode: verificationCode,
      });

      setSuccess(true);

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err: any) {
      console.error('Error confirming email:', err);

      let errorMessage = 'Error al verificar el código';

      if (err.code === 'CodeMismatchException' || err.message?.includes('Invalid verification code')) {
        errorMessage = 'El código es incorrecto, inténtalo de nuevo';
      } else if (err.code === 'LimitExceededException' || err.message?.includes('Attempt limit exceeded')) {
        errorMessage = 'Has excedido el límite de intentos, por favor intenta más tarde';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = () => {
    setNewEmail('');
    setVerificationCode('');
    setRequiresVerification(false);
    setError(null);
    setSuccess(false);
  };

  /**
   * Maneja el cierre del modal
   */
  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  /**
   * Maneja el cambio en el campo de email
   *
   * @param {string} value - Nuevo valor del email
   */
  const handleEmailChange = (value: string) => {
    setNewEmail(value);
    if (error) setError(null);
  };

  /**
   * Maneja el cambio en el campo de código de verificación
   *
   * @param {string} value - Nuevo valor del código
   */
  const handleCodeChange = (value: string) => {
    // Solo permitir números y máximo 6 caracteres
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(numericValue);
    if (error) setError(null);
  };

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={requiresVerification ? 'Verificar código' : 'Cambiar correo electrónico'}
      primaryAction={
        requiresVerification
          ? {
              content: success ? 'Email actualizado' : 'Verificar y cambiar',
              onAction: handleSubmitVerification,
              loading: isLoading,
              disabled: success,
            }
          : {
              content: 'Enviar código de verificación',
              onAction: handleSubmitEmail,
              loading: isLoading,
            }
      }
      secondaryActions={[
        {
          content: requiresVerification ? 'Volver' : 'Cancelar',
          onAction: requiresVerification ? () => setRequiresVerification(false) : handleClose,
          disabled: isLoading,
        },
      ]}>
      <Modal.Section>
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)} title="Error">
            <p>{error}</p>
          </Banner>
        )}

        {success && (
          <Banner tone="success" title="Éxito">
            <p>Tu correo electrónico ha sido actualizado exitosamente</p>
          </Banner>
        )}

        <FormLayout>
          {!requiresVerification ? (
            <>
              <Text as="p" variant="bodyMd">
                Introduce tu nuevo correo electrónico. Se enviará un código de verificación.
              </Text>

              <TextField
                label="Nuevo correo electrónico"
                type="email"
                value={newEmail}
                onChange={handleEmailChange}
                placeholder="ejemplo@gmail.com"
                autoComplete="email"
                disabled={isLoading}
              />
            </>
          ) : (
            <>
              <Text as="p" variant="bodyMd">
                Se ha enviado un código de verificación a: <strong>{newEmail}</strong>
              </Text>
              <Text as="p" variant="bodyMd">
                Introduce el código de 6 dígitos que recibiste por correo.
              </Text>

              <TextField
                label="Código de verificación"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder="123456"
                maxLength={6}
                autoComplete="one-time-code"
                disabled={isLoading || success}
                helpText="6 dígitos numéricos"
              />
            </>
          )}
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}
