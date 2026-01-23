import PagesClient from './PagesClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Páginas - Admin Panel',
    description: 'Gestiona las páginas de tu tienda',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <PagesClient />;
}
