import AnalyticsClient from './AnalyticsClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Analíticas - Admin Panel',
    description: 'Analiza el rendimiento de tu tienda',
  };
}

export default async function GeneralStatistics({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <AnalyticsClient />;
}
