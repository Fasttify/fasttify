import { useParams } from 'next/navigation'
import { routes } from '@/utils/routes'
import { LegacyCard, Text, Button } from '@shopify/polaris'
import { ProductIcon } from '@shopify/polaris-icons'
import Image from 'next/image'

export function ProductsPage() {
  const params = useParams()
  const storeId = params.slug as string

  return (
    <div className="bg-gray-100 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <ProductIcon className="w-5 h-5" />
        <Text as="h1" variant="headingLg" fontWeight="regular">
          Productos
        </Text>

        <Text as="p" variant="bodySm" tone="subdued">
          Administra y gestiona tus productos en tu tienda Fasttify.
        </Text>
      </div>

      <LegacyCard sectioned>
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="mb-6">
            <Image
              src="https://cdn.fasttify.com/assets/4530199.jpg"
              alt="Add products illustration"
              width={192}
              height={192}
              className="rounded-lg"
              objectFit="contain"
            />
          </div>

          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Añade tus productos
          </Text>

          <div className="mt-4 mb-6">
            <Text as="p" tone="subdued">
              Comienza abasteciendo tu tienda con productos que tus clientes amarán. Haz que los
              productos de dropshipping o print on demand se envíen directamente del proveedor a tu
              cliente, y paga solo por lo que vendas.
            </Text>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" url={routes.store.products.add(storeId)}>
              Añadir producto
            </Button>
            <Button>Importar productos</Button>
          </div>
        </div>
      </LegacyCard>
    </div>
  )
}
