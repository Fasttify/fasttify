import StatisticsClient from './StatisticsClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Estadísticas - Admin Panel',
    description: 'Analiza el rendimiento de tu tienda',
  };
}

export default async function GeneralStatistics({ params }: { params: Promise<{ slug: string }> }) {
  return <StatisticsClient />;
}
