import DashboardClient from './DashboardClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Dashboard - Admin Panel',
    description: 'Panel de control de tu tienda',
  };
}

export default async function DashboardPage({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <DashboardClient />;
}
