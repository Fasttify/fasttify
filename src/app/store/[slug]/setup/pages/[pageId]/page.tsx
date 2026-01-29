import EditPageClient from './EditPageClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Editar Página - Admin Panel',
    description: 'Edita los detalles de tu página',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <EditPageClient />;
}
