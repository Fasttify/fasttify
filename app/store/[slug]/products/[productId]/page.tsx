import EditProductClient from './EditProductClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Editar Producto - Admin Panel',
    description: 'Edita los detalles de tu producto',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <EditProductClient />;
}
