import ProductsClient from './ProductsClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Productos - Admin Panel',
    description: 'Gestiona los productos de tu tienda',
  };
}

export default async function StoreProductsPage({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <ProductsClient />;
}
