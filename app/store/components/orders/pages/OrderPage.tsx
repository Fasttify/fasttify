import { routes } from '@/utils/client/routes';
import { Card, Text } from '@shopify/polaris';
import { PackageIcon } from '@shopify/polaris-icons';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export function OrderPage() {
  const params = useParams();

  return (
    <div className="bg-gray-100 mt-8">
      <div className="flex items-start gap-3 mb-4">
        <PackageIcon className="w-5 h-5 mt-1" />
        <div>
          <Text as="h1" variant="headingLg" fontWeight="regular">
            Órdenes
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Administra y gestiona las órdenes de tus clientes en tu tienda Fasttify.
          </Text>
        </div>
      </div>

      <Card>
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="mb-6">
            <Image
              src="https://cdn.fasttify.com/assets/4530199.jpg"
              alt="Order illustration"
              width={192}
              height={192}
              className="rounded-lg"
              objectFit="contain"
            />
          </div>

          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Gestiona tus órdenes
          </Text>
          <div className="mt-4 mb-6">
            <Text as="p" tone="subdued">
              Monitorea y administra todas las órdenes de tus clientes. Ve el estado de cada pedido, gestiona envíos y
              mantén un control completo del proceso de venta.
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
