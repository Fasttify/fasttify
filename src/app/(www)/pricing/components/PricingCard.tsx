import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PricingCardProps {
  plan: {
    polarId: string;
    name: string;
    title: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    className: string;
    popular?: boolean;
  };
}

export function PricingCard({ plan }: PricingCardProps) {
  const router = useRouter();
  const formatPrice = (price: string) => {
    if (price === '0') return 'Gratis';
    const numPrice = Number.parseInt(price, 10);
    const formattedPrice = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);

    return `$ ${formattedPrice}`;
  };

  const handleSubscribe = () => {
    router.push('/my-store');
  };

  return (
    <motion.div
      className="relative rounded-2xl bg-white shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}>
      {plan.popular && (
        <div className="absolute -top-3 left-0 right-0">
          <div className="mx-auto w-fit rounded-full bg-primary px-4 py-1 text-center text-sm font-medium text-white shadow-md">
            Más popular
          </div>
        </div>
      )}
      <div className="p-8 flex flex-col h-full justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
            <span className="ml-2 text-sm text-gray-600">COP al mes</span>
            <p className="mt-1 text-sm text-gray-500">facturación mensual</p>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Funciones destacadas</h4>
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start">
                <Check className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          className={`w-full rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 bg-primary text-white hover:bg-primary-dark`}
          onClick={handleSubscribe}>
          {plan.buttonText}
        </Button>
      </div>
    </motion.div>
  );
}
