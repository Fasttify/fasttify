import ProfileClient from './ProfileClient';

interface ProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Perfil - Admin Panel',
    description: 'Gestiona tu perfil',
  };
}

/**
 * Página de perfil del usuario en el panel de administración
 *
 * @param {ProfilePageProps} props - Propiedades de la página
 * @returns {JSX.Element} Página de perfil
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  return <ProfileClient storeId={slug} />;
}
