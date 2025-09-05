import AccountSettingsClient from './AccountSettingsClient';

export async function generateMetadata() {
  return {
    title: 'Mi Perfil | Fasttify',
    description: 'Gestiona tu perfil, pagos y sesiones en Fasttify',
  };
}

export default function AccountSettingsPage() {
  return <AccountSettingsClient />;
}
