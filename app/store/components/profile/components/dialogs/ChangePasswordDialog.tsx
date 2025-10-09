import { Modal, TextField, FormLayout, Banner, Icon } from '@shopify/polaris';
import { ViewIcon, HideIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { updatePassword } from 'aws-amplify/auth';
import { confirmResetPasswordSchema } from '@/lib/zod-schemas/schemas';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Diálogo modal para cambiar la contraseña del usuario usando Shopify Polaris
 *
 * @component
 * @param {ChangePasswordDialogProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal con formulario de cambio de contraseña
 */
export function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const [formData, setFormData] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<PasswordFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Valida los datos del formulario de contraseña usando Zod schema
   *
   * @param {PasswordFormData} data - Datos a validar
   * @returns {boolean} True si los datos son válidos
   */
  const validateForm = (data: PasswordFormData): boolean => {
    const errors: Partial<PasswordFormData> = {};

    // Validar contraseña actual
    if (!data.oldPassword.trim()) {
      errors.oldPassword = 'La contraseña actual es requerida';
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (data.oldPassword === data.newPassword) {
      errors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    // Usar el schema de Zod para validar newPassword y confirmPassword
    try {
      confirmResetPasswordSchema.parse({
        code: 'dummy', // No necesitamos validar el código aquí
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path[0] === 'newPassword') {
            errors.newPassword = err.message;
          } else if (err.path[0] === 'confirmPassword') {
            errors.confirmPassword = err.message;
          }
        });
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Maneja el envío del formulario de cambio de contraseña
   */
  const handleSubmit = async () => {
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updatePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(true);

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setValidationErrors({});
    setError(null);
    setSuccess(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
   * Maneja el cambio en los campos del formulario
   *
   * @param {string} field - Campo que cambió
   * @param {string} value - Nuevo valor
   */
  const handleFieldChange = (field: keyof PasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error de validación del campo cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Limpiar mensajes de estado
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Cambiar contraseña"
      primaryAction={{
        content: success ? 'Contraseña actualizada' : 'Cambiar contraseña',
        onAction: handleSubmit,
        loading: isLoading,
        disabled: success,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: handleClose,
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
            <p>Contraseña actualizada exitosamente</p>
          </Banner>
        )}

        <FormLayout>
          <TextField
            label="Contraseña actual"
            type={showOldPassword ? 'text' : 'password'}
            value={formData.oldPassword}
            onChange={(value) => handleFieldChange('oldPassword', value)}
            error={validationErrors.oldPassword}
            autoComplete="current-password"
            disabled={isLoading || success}
            suffix={
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                disabled={isLoading || success}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--p-color-text)',
                  opacity: isLoading || success ? 0.5 : 1,
                }}>
                <Icon source={showOldPassword ? HideIcon : ViewIcon} />
              </button>
            }
          />

          <TextField
            label="Nueva contraseña"
            type={showNewPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(value) => handleFieldChange('newPassword', value)}
            error={validationErrors.newPassword}
            autoComplete="new-password"
            helpText="Mínimo 8 caracteres"
            disabled={isLoading || success}
            suffix={
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading || success}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--p-color-text)',
                  opacity: isLoading || success ? 0.5 : 1,
                }}>
                <Icon source={showNewPassword ? HideIcon : ViewIcon} />
              </button>
            }
          />

          <TextField
            label="Confirmar nueva contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(value) => handleFieldChange('confirmPassword', value)}
            error={validationErrors.confirmPassword}
            autoComplete="new-password"
            disabled={isLoading || success}
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || success}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--p-color-text)',
                  opacity: isLoading || success ? 0.5 : 1,
                }}>
                <Icon source={showConfirmPassword ? HideIcon : ViewIcon} />
              </button>
            }
          />
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}
