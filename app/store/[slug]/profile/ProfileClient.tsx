'use client';

import { AppProvider } from '@shopify/polaris';
import esTranslations from '@shopify/polaris/locales/es.json';
import '@shopify/polaris/build/esm/styles.css';
import { ProfileFrame } from '@/app/store/components/profile/components/ProfileFrame';
import { ProfilePage } from '@/app/store/components/profile/pages/ProfilePage';

interface ProfileClientProps {
  storeId: string;
}

/**
 * Cliente de la página de perfil con configuración de Polaris
 *
 * @component
 * @param {ProfileClientProps} props - Propiedades del componente
 * @returns {JSX.Element} Cliente con providers y configuración
 */
export default function ProfileClient({ storeId }: ProfileClientProps) {
  return (
    <AppProvider i18n={esTranslations}>
      <ProfileFrame storeId={storeId}>
        <ProfilePage storeId={storeId} />
      </ProfileFrame>
    </AppProvider>
  );
}
