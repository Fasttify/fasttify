import PagesClient from './PagesClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Páginas - Admin Panel',
    description: 'Gestiona las páginas de tu tienda',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <PagesClient />;
}
