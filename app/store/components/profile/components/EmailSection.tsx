import { Card, Text, Button, Banner, SkeletonBodyText, Icon } from '@shopify/polaris';
import { EditIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import type { UserProps } from '../types';

interface EmailSectionProps extends UserProps {
  onEditClick: () => void;
  isGoogleUser?: boolean;
}

/**
 * Componente para mostrar y gestionar la información de email del usuario
 *
 * @component
 * @param {EmailSectionProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección de email con opción de edición
 */
export function EmailSection({ user, loading, onEditClick, isGoogleUser = false }: EmailSectionProps) {
  if (loading) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <SkeletonBodyText lines={4} />
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <Text variant="headingMd" as="h3">
            No se pudo cargar la información de email
          </Text>
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
            Correo Electrónico
          </Text>

          <Button icon={EditIcon} onClick={onEditClick} disabled={isGoogleUser} size="slim">
            {isGoogleUser ? 'Gestionado por Google' : 'Cambiar correo'}
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              Email actual
            </Text>
            <Text variant="bodyMd" as="p">
              {user.email}
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
              Verificado
            </Text>
          </div>
        </div>

        {isGoogleUser && (
          <div style={{ marginTop: '20px' }}>
            <Banner tone="info">
              <p>
                Tu correo electrónico se gestiona a través de tu cuenta de Google. Para modificarlo, actualiza tu cuenta
                en Google.
              </p>
            </Banner>
          </div>
        )}

        {!isGoogleUser && (
          <div style={{ marginTop: '12px' }}>
            <Text variant="bodySm" as="p" tone="subdued">
              Se enviará un código de verificación a tu nueva dirección para confirmar el cambio.
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
}
