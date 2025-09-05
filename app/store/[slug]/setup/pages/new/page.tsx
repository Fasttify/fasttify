import NewPageClient from './NewPageClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Nueva Página - Admin Panel',
    description: 'Crea una nueva página para tu tienda',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <NewPageClient />;
}
