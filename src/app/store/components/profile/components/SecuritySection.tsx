import { Card, Text, Button, Banner, SkeletonBodyText, Icon } from '@shopify/polaris';
import { LockIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import type { UserProps } from '../types';

interface SecuritySectionProps extends UserProps {
  onChangePasswordClick: () => void;
  isGoogleUser?: boolean;
}

/**
 * Componente para mostrar la sección de seguridad y cambio de contraseña
 *
 * @component
 * @param {SecuritySectionProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección de seguridad con opción de cambio de contraseña
 */
export function SecuritySection({ user, loading, onChangePasswordClick, isGoogleUser = false }: SecuritySectionProps) {
  if (loading || !user) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <SkeletonBodyText lines={6} />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>
          <Text variant="headingMd" as="h3">
            Seguridad
          </Text>

          <Button icon={LockIcon} onClick={onChangePasswordClick} disabled={isGoogleUser} size="slim">
            {isGoogleUser ? 'Gestionado por Google' : 'Cambiar contraseña'}
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              Contraseña
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Cambia tu contraseña regularmente para mantener tu cuenta segura
            </Text>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              flexShrink: 0,
            }}>
            <Icon source={CheckCircleIcon} tone="success" />
            <Text variant="bodySm" as="span" tone="success" fontWeight="medium">
              Segura
            </Text>
          </div>
        </div>

        {isGoogleUser && (
          <div style={{ marginTop: '20px' }}>
            <Banner tone="info">
              <p>
                Tu contraseña se gestiona a través de tu cuenta de Google. Para modificarla, actualiza tu cuenta en
                Google.
              </p>
            </Banner>
          </div>
        )}

        {!isGoogleUser && (
          <div style={{ marginTop: '12px' }}>
            <Text variant="bodySm" as="p" tone="subdued">
              Recomendación: Usa una contraseña única con mayúsculas, minúsculas, números y símbolos.
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
}
