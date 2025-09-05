import ProcessingClient from './ProcessingClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Pedidos en Proceso - Admin Panel',
    description: 'Gestiona los pedidos que están siendo procesados',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ProcessingClient />;
}
