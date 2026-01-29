import DashboardClient from './DashboardClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Inicio - Admin Panel',
    description: 'Panel de control de tu tienda',
  };
}

export default async function DashboardPage({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <DashboardClient />;
}
