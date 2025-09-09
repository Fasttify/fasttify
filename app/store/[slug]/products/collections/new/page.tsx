import NewCollectionClient from './NewCollectionClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Nueva Colección - Admin Panel',
    description: 'Crea una nueva colección de productos',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <NewCollectionClient />;
}
