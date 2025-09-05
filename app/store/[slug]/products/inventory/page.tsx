import InventoryClient from './InventoryClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Inventario - Admin Panel',
    description: 'Gestiona el inventario de tus productos',
  };
}

export default async function InventoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return <InventoryClient />;
}
