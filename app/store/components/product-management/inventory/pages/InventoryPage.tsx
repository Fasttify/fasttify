import { routes } from '@/utils/client/routes';
import { getStoreId } from '@/utils/client/store-utils';
import { Button, EmptyState, LegacyCard, Text } from '@shopify/polaris';
import { InventoryIcon } from '@shopify/polaris-icons';
import { useParams, usePathname, useRouter } from 'next/navigation';

export function InventoryPage() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const storeId = getStoreId(params, pathname);

  return (
    <div className="bg-gray-100 mt-8">
      {/* Header similar a ProductsPage y CollectionsPage */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-0">
            <InventoryIcon className="w-5 h-5 flex-shrink-0" />
            <Text as="h1" variant="headingLg" fontWeight="regular">
              Inventario
            </Text>
          </div>
          <Text variant="bodySm" tone="subdued" as="p">
            Administra y controla el stock de tus productos en tiempo real.
          </Text>
        </div>
        <Button variant="primary" onClick={() => router.push(routes.store.products.main(storeId))}>
          Ir a productos
        </Button>
      </div>

      {/* Contenido principal con EmptyState */}
      <LegacyCard sectioned>
        <EmptyState
          fullWidth
          heading="Haz seguimiento de tu inventario"
          action={{
            content: 'Ir a productos',
            onAction: () => router.push(routes.store.products.main(storeId)),
          }}
          secondaryAction={{
            content: 'Aprender más sobre inventario',
            url: '#',
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
          <p>
            Cuando habilites el seguimiento de inventario en tus productos, podrás ver y ajustar sus recuentos de
            inventario aquí. Mantén control total sobre tu stock y evita quedarte sin productos.
          </p>
        </EmptyState>
      </LegacyCard>

      {/* Footer con información adicional */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Text variant="bodySm" tone="subdued" as="p">
          Más información sobre gestión de inventario y stock en nuestra documentación
        </Text>
      </div>
    </div>
  );
}
