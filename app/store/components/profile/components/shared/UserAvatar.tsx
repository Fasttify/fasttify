import { Spinner } from '@shopify/polaris';
import { useRef, useState, memo, useCallback } from 'react';
import { useUpdateProfilePicture } from '@/app/store/hooks/profile';
import { useSecureUrl } from '@/hooks/auth/useSecureUrl';
import { ImageIcon } from '@shopify/polaris-icons';
import Image from 'next/image';

interface UserAvatarProps {
  imageUrl?: string;
  fallback: string;
  disabled?: boolean;
}

/**
 * Componente de avatar de usuario con funcionalidad de actualización de imagen
 * Adaptado para usar componentes de Shopify Polaris
 *
 * @component
 * @param {UserAvatarProps} props - Propiedades del componente
 * @returns {JSX.Element} Avatar con funcionalidad de cambio de imagen
 */
function UserAvatarComponent({ imageUrl, fallback, disabled = false }: UserAvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfilePicture, isLoading } = useUpdateProfilePicture();

  // Obtener URL firmada para la imagen
  const { url: secureUrl, isLoading: isUrlLoading } = useSecureUrl({
    baseUrl: imageUrl || '',
    type: 'profile-image',
    enabled: !!imageUrl,
  });

  /**
   * Maneja la selección de archivo para actualizar la imagen de perfil
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - Evento de selección de archivo
   */
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || disabled) return;

      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona solo archivos de imagen (JPG, PNG, GIF, etc.)');
        return;
      }

      // Validar tamaño del archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('La imagen es demasiado grande. El tamaño máximo permitido es 5MB');
        return;
      }

      // Validar dimensiones de la imagen
      const img = new window.Image();
      img.onload = async () => {
        // Validar dimensiones mínimas y máximas
        if (img.width < 100 || img.height < 100) {
          alert('La imagen debe tener al menos 100x100 píxeles');
          return;
        }

        if (img.width > 2048 || img.height > 2048) {
          alert('La imagen no puede ser mayor a 2048x2048 píxeles');
          return;
        }

        // Mostrar una vista previa de la imagen seleccionada
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
          // Subir la imagen a S3 y actualizar el atributo `picture`
          await updateProfilePicture(file);
        } catch (error) {
          console.error('Error updating profile picture:', error);
          setPreviewUrl(null);
        }
      };

      img.onerror = () => {
        alert('El archivo seleccionado no es una imagen válida');
        return;
      };

      img.src = URL.createObjectURL(file);
    },
    [disabled, updateProfilePicture]
  );

  /**
   * Maneja el clic en el avatar para abrir el selector de archivos
   */
  const handleAvatarClick = useCallback(() => {
    if (!disabled && !isLoading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isLoading]);

  // Determinar la URL de la imagen a mostrar
  const displayUrl = previewUrl || secureUrl;

  // Mostrar loading mientras se obtiene la URL firmada
  if (isUrlLoading && imageUrl) {
    return (
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--p-color-bg-surface-subdued)',
          border: '3px solid var(--p-color-border)',
        }}>
        <Spinner accessibilityLabel="Cargando imagen de perfil" size="small" />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={handleAvatarClick}
        style={{
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          opacity: disabled || isLoading ? 0.6 : 1,
          transition: 'opacity 0.2s ease',
        }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--p-color-bg-surface-subdued)',
            border: '3px solid var(--p-color-border)',
          }}>
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={fallback}
              width={120}
              height={120}
              style={{
                objectFit: 'cover',
              }}
            />
          ) : (
            <span
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'var(--p-color-text)',
              }}>
              {fallback.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {!disabled && !isLoading && (
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            backgroundColor: 'var(--p-color-bg-surface-success)',
            borderRadius: '50%',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            border: '2px solid var(--p-color-bg-surface)',
          }}>
          <ImageIcon width={16} height={16} />
        </div>
      )}

      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Spinner accessibilityLabel="Subiendo imagen" size="small" />
        </div>
      )}

      {!disabled && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          disabled={isLoading}
        />
      )}
    </div>
  );
}

// Memoizar el componente para evitar re-renders innecesarios
export const UserAvatar = memo(UserAvatarComponent);
