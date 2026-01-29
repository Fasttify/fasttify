import AppsClient from './AppsClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Aplicaciones - Admin Panel',
    description: 'Gestiona las integraciones y aplicaciones de tu tienda',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <AppsClient />;
}
