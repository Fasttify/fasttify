import { Modal, TextField, FormLayout, Banner } from '@shopify/polaris';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/hooks/useAuth';
import { useProfileManagement } from '@/app/store/hooks/profile';
import type { ProfileFormData } from '@/app/store/components/profile/types';

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Diálogo modal para editar el perfil del usuario usando Shopify Polaris
 *
 * @component
 * @param {EditProfileDialogProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal con formulario de edición de perfil
 */
export function EditProfileDialog({ isOpen, onClose }: EditProfileDialogProps) {
  const { user } = useAuth();
  const { updateMultipleAttributes, isLoading, error, clearError } = useProfileManagement();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<ProfileFormData>>({});

  /**
   * Inicializa el formulario con los datos del usuario actual
   */
  useEffect(() => {
    if (user && isOpen) {
      const fullName = user.nickName || '';
      const nameParts = fullName.split(' ');

      requestAnimationFrame(() => {
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts[nameParts.length - 1] || '',
          phone: user.phone || '',
          bio: user.bio || '',
        });
      });
      requestAnimationFrame(() => {
        setValidationErrors({});
      });
      clearError();
    }
  }, [user, isOpen, clearError]);

  /**
   * Valida los datos del formulario
   *
   * @param {ProfileFormData} data - Datos a validar
   * @returns {boolean} True si los datos son válidos
   */
  const validateForm = (data: ProfileFormData): boolean => {
    const errors: Partial<ProfileFormData> = {};

    if (!data.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    }

    if (!data.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    }

    if (data.phone && data.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(data.phone.trim())) {
      errors.phone = 'El formato del teléfono no es válido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async () => {
    if (!validateForm(formData)) {
      return;
    }

    try {
      const nickname = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      await updateMultipleAttributes({
        nickname,
        phone: formData.phone?.trim() || undefined,
        bio: formData.bio?.trim() || undefined,
      });

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  /**
   * Maneja el cambio en los campos del formulario
   *
   * @param {string} field - Campo que cambió
   * @param {string} value - Nuevo valor
   */
  const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error de validación del campo cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Editar perfil"
      primaryAction={{
        content: 'Guardar cambios',
        onAction: handleSubmit,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: onClose,
        },
      ]}>
      <Modal.Section>
        {error && (
          <Banner tone="critical" onDismiss={clearError} title="Error">
            <p>{error}</p>
          </Banner>
        )}

        <FormLayout>
          <TextField
            label="Nombre"
            value={formData.firstName}
            onChange={(value) => handleFieldChange('firstName', value)}
            error={validationErrors.firstName}
            autoComplete="given-name"
          />

          <TextField
            label="Apellido"
            value={formData.lastName}
            onChange={(value) => handleFieldChange('lastName', value)}
            error={validationErrors.lastName}
            autoComplete="family-name"
          />

          <TextField
            label="Teléfono"
            value={formData.phone}
            onChange={(value) => handleFieldChange('phone', value)}
            error={validationErrors.phone}
            type="tel"
            autoComplete="tel"
            helpText="Formato: +1234567890"
          />

          <TextField
            label="Biografía"
            value={formData.bio}
            onChange={(value) => handleFieldChange('bio', value)}
            multiline={4}
            autoComplete="off"
            helpText="Cuéntanos un poco sobre ti (opcional)"
          />
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}
