import NewProductClient from './NewProductClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Nuevo Producto - Admin Panel',
    description: 'Agrega un nuevo producto a tu tienda',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <NewProductClient />;
}
