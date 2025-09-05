import CollectionsClient from './CollectionsClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Colecciones - Admin Panel',
    description: 'Gestiona las colecciones de productos de tu tienda',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <CollectionsClient />;
}
