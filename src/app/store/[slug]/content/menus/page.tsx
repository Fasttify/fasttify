import NavigationClient from './NavigationClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Menús - Admin Panel',
    description: 'Configura los menús de navegación de tu tienda',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <NavigationClient storeId={slug} />;
}
