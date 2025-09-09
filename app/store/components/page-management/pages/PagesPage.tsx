import { routes } from '@/utils/client/routes';
import { EmptyState, LegacyCard, Text } from '@shopify/polaris';
import { PageIcon } from '@shopify/polaris-icons';

export function PagesPage({ storeId }: { storeId: string }) {
  return (
    <div className="mt-8">
      <div className="flex items-start gap-3 mb-4">
        <PageIcon className="w-5 h-5 mt-1" />
        <div>
          <Text as="h1" variant="headingLg" fontWeight="regular">
            Páginas
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Crea y gestiona páginas adicionales para tu tienda como &quot;Acerca de&quot;, &quot;Contacto&quot;,
            políticas, etc.
          </Text>
        </div>
      </div>

      <LegacyCard sectioned>
        <EmptyState
          heading="Crea páginas para tu tienda"
          action={{
            content: 'Crear página',
            url: routes.store.setup.pagesNew(storeId),
          }}
          secondaryAction={{
            content: 'Ver plantillas',
            onAction: () => console.log('Ver plantillas'),
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
          <p>
            Añade páginas importantes como &quot;Acerca de nosotros&quot;, &quot;Política de privacidad&quot;,
            &quot;Términos de servicio&quot; y más para proporcionar información esencial a tus clientes.
          </p>
        </EmptyState>
      </LegacyCard>
    </div>
  );
}
