import CheckoutsClient from './CheckoutsClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Checkouts - Admin Panel',
    description: 'Gestiona los procesos de checkout de tu tienda',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <CheckoutsClient />;
}
