import { FeatureSteps } from '@/components/ui/feature-section';

const features = [
  {
    step: 'Step 1',
    title: 'Gestión Eficiente',
    content: 'Administra tu tienda, productos y pedidos de manera simple y rápida.',
    image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=2070&auto=format&fit=crop',
  },
  {
    step: 'Step 2',
    title: 'Personalización Avanzada',
    content: 'Personaliza tu tienda con opciones modernas y flexibles para destacar en el mercado.',
    image: 'https://images.unsplash.com/photo-1690228254548-31ef53e40cd1?q=80&w=2071&auto=format&fit=crop',
  },
  {
    step: 'Step 3',
    title: 'Automatización Total',
    content: 'Optimiza procesos y ahorra tiempo para enfocarte en el crecimiento de tu negocio.',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=2006&auto=format&fit=crop',
  },
];

export function Feature() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-primary font-medium tracking-wider uppercase">Características</span>
          <h2 className="text-3xl md:text-4xl font-medium text-black mt-4">
            Todo lo que necesitas para tu tienda online
          </h2>
          <p className="text-gray-600 mt-2">Herramientas esenciales para impulsar tu negocio con eficiencia.</p>
        </div>

        {/* Use the new FeatureSteps component for a more compact layout */}
        <FeatureSteps features={features} />
      </div>
    </section>
  );
}
