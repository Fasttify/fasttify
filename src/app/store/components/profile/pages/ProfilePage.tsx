import { Page, Layout } from '@shopify/polaris';
import { useState, useMemo } from 'react';
import { useAuth } from '@/context/hooks/useAuth';
import { ProfileHeader } from '@/app/store/components/profile/components/ProfileHeader';
import { PersonalInformation } from '@/app/store/components/profile/components/PersonalInformation';
import { EmailSection } from '@/app/store/components/profile/components/EmailSection';
import { SecuritySection } from '@/app/store/components/profile/components/SecuritySection';
import { SubscriptionSection } from '@/app/store/components/profile/components/SubscriptionSection';
import { SessionsSection } from '@/app/store/components/profile/components/SessionsSection';
import { DangerZone } from '@/app/store/components/profile/components/DangerZone';
import { EditProfileDialog } from '@/app/store/components/profile/components/dialogs/EditProfileDialog';
import { ChangePasswordDialog } from '@/app/store/components/profile/components/dialogs/ChangePasswordDialog';
import { ChangeEmailDialog } from '@/app/store/components/profile/components/dialogs/ChangeEmailDialog';
import { ProfilePageSkeleton } from '@/app/store/components/profile/components/ProfilePageSkeleton';

interface ProfilePageProps {
  storeId: string;
}

/**
 * Página principal del perfil de usuario con todos los componentes integrados
 *
 * @component
 * @param {ProfilePageProps} props - Propiedades del componente
 * @returns {JSX.Element} Página completa de perfil
 */
export function ProfilePage({ storeId }: ProfilePageProps) {
  const { user, loading } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);

  /**
   * Determina si el usuario usa Google para autenticarse
   */
  const isGoogleUser = useMemo(() => {
    return user?.identities?.some(
      (identity) => identity.providerType === 'Google' || identity.providerName === 'Google'
    );
  }, [user?.identities]);

  if (loading) {
    return (
      <Page title="Mi Perfil" subtitle="Gestiona tu información personal y configuración de cuenta">
        <Layout>
          <Layout.Section>
            <ProfilePageSkeleton isGoogleUser={isGoogleUser} />
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <>
      <Page title="Mi Perfil" subtitle="Gestiona tu información personal y configuración de cuenta">
        <Layout>
          <Layout.Section>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
              <ProfileHeader
                user={user}
                loading={loading}
                onEditClick={() => setIsEditProfileOpen(true)}
                isGoogleUser={isGoogleUser}
              />

              <PersonalInformation
                user={user}
                loading={loading}
                isGoogleUser={isGoogleUser}
                onEditClick={() => setIsEditProfileOpen(true)}
              />

              <EmailSection
                user={user}
                loading={loading}
                onEditClick={() => setIsChangeEmailOpen(true)}
                isGoogleUser={isGoogleUser}
              />

              <SecuritySection
                user={user}
                loading={loading}
                onChangePasswordClick={() => setIsChangePasswordOpen(true)}
                isGoogleUser={isGoogleUser}
              />

              <SubscriptionSection user={user} loading={loading} storeId={storeId} />

              {!isGoogleUser && <SessionsSection isGoogleUser={isGoogleUser} />}

              <DangerZone user={user} loading={loading} isGoogleUser={isGoogleUser} />
            </div>
          </Layout.Section>
        </Layout>
      </Page>

      <EditProfileDialog isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />

      <ChangePasswordDialog isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />

      <ChangeEmailDialog
        isOpen={isChangeEmailOpen}
        onClose={() => setIsChangeEmailOpen(false)}
        currentEmail={user?.email || ''}
      />
    </>
  );
}
