import GeneralClient from './GeneralClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Configuración General - Admin Panel',
    description: 'Configura los aspectos generales de tu tienda',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <GeneralClient />;
}
