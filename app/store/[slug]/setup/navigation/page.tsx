import NavigationClient from './NavigationClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Navegación - Admin Panel',
    description: 'Configura el menú de navegación de tu tienda',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <NavigationClient storeId={slug} />;
}
