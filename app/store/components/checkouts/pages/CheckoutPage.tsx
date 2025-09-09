import { Card, Text } from '@shopify/polaris';
import { CreditCardIcon } from '@shopify/polaris-icons';
import Image from 'next/image';

export function CheckoutPage() {
  return (
    <div className="bg-gray-100 mt-8">
      <div className="flex items-start gap-3 mb-4">
        <CreditCardIcon className="w-5 h-5 mt-1" />
        <div>
          <Text as="h1" variant="headingLg" fontWeight="regular">
            Checkouts
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Administra y gestiona las sesiones de checkout de tus clientes en tu tienda Fasttify.
          </Text>
        </div>
      </div>

      <Card>
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="mb-6">
            <Image
              src="https://cdn.fasttify.com/assets/4530199.jpg"
              alt="Checkout illustration"
              width={192}
              height={192}
              className="rounded-lg"
              objectFit="contain"
            />
          </div>

          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Gestiona tus checkouts
          </Text>
          <div className="mt-4 mb-6">
            <Text as="p" tone="subdued">
              Monitorea y administra todas las sesiones de checkout de tus clientes. Ve el estado de cada transacción,
              gestiona pagos y mantén un control completo del proceso de compra.
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
