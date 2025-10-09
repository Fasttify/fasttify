import { Card, Text, Button, Badge, SkeletonThumbnail, SkeletonBodyText } from '@shopify/polaris';
import { EditIcon } from '@shopify/polaris-icons';
import { UserAvatar } from '@/app/store/components/profile/components/shared/UserAvatar';
import type { UserProps } from '@/app/store/components/profile/types';

interface ProfileHeaderProps extends UserProps {
  onEditClick: () => void;
  isGoogleUser?: boolean;
}

/**
 * Componente header del perfil que muestra avatar, nombre y plan del usuario
 *
 * @component
 * @param {ProfileHeaderProps} props - Propiedades del componente
 * @returns {JSX.Element} Header del perfil con avatar y información básica
 */
export function ProfileHeader({ user, loading, onEditClick, isGoogleUser = false }: ProfileHeaderProps) {
  if (loading) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SkeletonThumbnail size="large" />
            <div style={{ flex: 1 }}>
              <SkeletonBodyText lines={2} />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <Text variant="headingMd" as="h2">
            No se pudo cargar la información del usuario
          </Text>
        </div>
      </Card>
    );
  }

  const fullName = user.nickName || '';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';
  const displayName = `${firstName} ${lastName}`.trim() || 'Usuario';

  return (
    <Card>
      <div style={{ padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <UserAvatar imageUrl={user.picture} fallback={displayName} disabled={isGoogleUser} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Text variant="headingMd" as="h2">
                  {displayName}
                </Text>
                {isGoogleUser && <Badge tone="info">Google</Badge>}
              </div>

              <Text variant="bodyMd" as="p" tone="subdued">
                Plan activo: {user.plan || 'Gratuito'}
              </Text>
            </div>
          </div>

          <Button icon={EditIcon} onClick={onEditClick} disabled={isGoogleUser} size="slim">
            {isGoogleUser ? 'Perfil gestionado por Google' : 'Editar perfil'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
