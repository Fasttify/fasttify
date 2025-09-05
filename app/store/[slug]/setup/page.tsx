import SetupClient from './SetupClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Configuración - Admin Panel',
    description: 'Configura tu tienda y personaliza su apariencia',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <SetupClient />;
}
