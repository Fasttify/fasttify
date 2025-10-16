import SelectPlanClient from './SelectPlanClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Selección de plan - Admin Panel',
    description: 'Selecciona el plan que deseas suscribirte',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <SelectPlanClient />;
}
