import OrdersClient from './OrdersClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Pedidos - Admin Panel',
    description: 'Gestiona los pedidos de tu tienda',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <OrdersClient />;
}
