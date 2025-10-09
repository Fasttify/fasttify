import { Card, Text, Button, Banner, SkeletonBodyText } from '@shopify/polaris';
import { EditIcon } from '@shopify/polaris-icons';
import type { PersonalInformationProps } from '@/app/store/components/profile/types';

interface PersonalInformationWithAction extends PersonalInformationProps {
  onEditClick: () => void;
}

/**
 * Componente para mostrar la información personal del usuario
 *
 * @component
 * @param {PersonalInformationWithAction} props - Propiedades del componente
 * @returns {JSX.Element} Sección de información personal
 */
export function PersonalInformation({
  user,
  loading,
  isGoogleUser = false,
  onEditClick,
}: PersonalInformationWithAction) {
  if (loading) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <SkeletonBodyText lines={6} />
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <Text variant="headingMd" as="h3">
            No se pudo cargar la información personal
          </Text>
        </div>
      </Card>
    );
  }

  const fullName = user.nickName || '';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';

  const personalInfo = [
    {
      label: 'Nombre',
      value: firstName || 'No especificado',
      key: 'firstName',
    },
    {
      label: 'Apellido',
      value: lastName || 'No especificado',
      key: 'lastName',
    },
    {
      label: 'Teléfono',
      value: user.phone || 'No especificado',
      key: 'phone',
    },
    {
      label: 'Biografía',
      value: user.bio || 'No especificado',
      key: 'bio',
    },
  ];

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
            Información Personal
          </Text>

          <Button icon={EditIcon} onClick={onEditClick} disabled={isGoogleUser} size="slim">
            {isGoogleUser ? 'Edición deshabilitada' : 'Editar'}
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {personalInfo.map((item) => (
            <div key={item.key}>
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                {item.label}
              </Text>
              <Text variant="bodyMd" as="p" tone={item.value === 'No especificado' ? 'subdued' : undefined}>
                {item.value}
              </Text>
            </div>
          ))}
        </div>

        {isGoogleUser && (
          <div style={{ marginTop: '20px' }}>
            <Banner tone="info">
              <p>
                Tu información personal se gestiona a través de tu cuenta de Google. Para modificarla, actualiza tu
                perfil en Google.
              </p>
            </Banner>
          </div>
        )}
      </div>
    </Card>
  );
}
