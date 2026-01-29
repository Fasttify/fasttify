import PaymentsClient from './PaymentsClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Pagos - Admin Panel',
    description: 'Configura los métodos de pago de tu tienda',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <PaymentsClient />;
}
