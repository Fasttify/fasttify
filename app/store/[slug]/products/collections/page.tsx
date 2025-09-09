import CollectionsClient from './CollectionsClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Colecciones - Admin Panel',
    description: 'Gestiona las colecciones de productos de tu tienda',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <CollectionsClient />;
}
