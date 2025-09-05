import EditCollectionClient from './EditCollectionClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Editar Colección - Admin Panel',
    description: 'Edita los detalles de tu colección',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <EditCollectionClient />;
}
