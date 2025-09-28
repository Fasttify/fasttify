import { useCollections } from '@/app/store/hooks/data/useCollection/useCollections';
import { routes } from '@/utils/client/routes';
import { getStoreId } from '@/utils/client/store-utils';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Filters,
  IndexTable,
  Link,
  ResourceItem,
  ResourceList,
  SkeletonBodyText,
  SkeletonDisplayText,
  Spinner,
  Tabs,
  Text,
} from '@shopify/polaris';
import { FileIcon, ProductIcon } from '@shopify/polaris-icons';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

type FilterType = 'all' | 'active' | 'inactive';

// Skeleton component for the collections table using Polaris
function _CollectionsTableSkeleton() {
  const resourceName = {
    singular: 'colección',
    plural: 'colecciones',
  };

  return (
    <Card>
      <ResourceList
        resourceName={resourceName}
        items={Array(5)
          .fill(0)
          .map((_, index) => ({ id: `skeleton-${index}` }))}
        renderItem={() => (
          <ResourceItem id="skeleton" url="">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px' }}>
                <SkeletonDisplayText size="small" />
              </div>
              <div style={{ flex: 1 }}>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={1} />
              </div>
              <div style={{ width: '60px' }}>
                <SkeletonBodyText lines={1} />
              </div>
            </div>
          </ResourceItem>
        )}
      />
    </Card>
  );
}

export function CollectionsPage() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const storeId = getStoreId(params, pathname);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const { useListCollections } = useCollections();
  const { data: collections, isLoading, error } = useListCollections(storeId);

  // Filtrar colecciones según el tab activo y el término de búsqueda
  const filteredCollections = collections?.filter((collection) => {
    if (activeFilter === 'all') {
    } else if (activeFilter === 'active' && !collection.isActive) {
      return false;
    } else if (activeFilter === 'inactive' && collection.isActive) {
      return false;
    }

    // Filtrar por término de búsqueda
    if (searchTerm && !collection.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Manejar cambio de filtro y búsqueda
  const handleFilterChange = (filter: FilterType, search?: string) => {
    setActiveFilter(filter);
    if (search !== undefined) {
      setSearchTerm(search);
    }
  };

  // Tabs configuration
  const tabs = [
    {
      id: 'all',
      content: 'Todas',
      panelID: 'all-collections',
    },
    {
      id: 'active',
      content: 'Activas',
      panelID: 'active-collections',
    },
    {
      id: 'inactive',
      content: 'Inactivas',
      panelID: 'inactive-collections',
    },
  ];

  const resourceName = {
    singular: 'colección',
    plural: 'colecciones',
  };

  const rowMarkup = filteredCollections?.map((collection, index) => (
    <IndexTable.Row
      id={collection.id}
      key={collection.id}
      position={index}
      selected={selectedResources.includes(collection.id)}
      onClick={() => {
        router.push(routes.store.products.collectionsEdit(storeId, collection.id));
      }}>
      <IndexTable.Cell>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileIcon className="w-5 h-5" />
          <div>
            <Text variant="bodyMd" fontWeight="semibold" as="span">
              {collection.title || 'Sin título'}
            </Text>
          </div>
        </div>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={collection.isActive ? 'success' : 'critical'}>{collection.isActive ? 'Activa' : 'Borrador'}</Badge>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <div className="bg-gray-100 mt-8">
      {/* Header similar a ProductsPage */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ProductIcon className="w-5 h-5" />
            <Text as="h1" variant="headingLg" fontWeight="regular">
              Colecciones
            </Text>
          </div>
          <Text variant="bodySm" tone="subdued" as="p">
            Organiza tus productos en colecciones para facilitar la navegación de tus clientes.
          </Text>
        </div>

        <Button variant="primary" onClick={() => router.push(routes.store.products.collectionsNew(storeId))}>
          Crear colección
        </Button>
      </div>

      {/* Contenido principal */}
      <Card>
        <Tabs
          tabs={tabs}
          selected={tabs.findIndex((tab) => tab.id === activeFilter)}
          onSelect={(selectedTabIndex) => {
            const selectedTab = tabs[selectedTabIndex];
            handleFilterChange(selectedTab.id as FilterType);
          }}
        />

        <div style={{ padding: '16px' }}>
          <Filters
            queryValue={searchTerm}
            filters={[]}
            onQueryChange={setSearchTerm}
            onQueryClear={() => setSearchTerm('')}
            queryPlaceholder="Buscar colecciones..."
            onClearAll={() => {}}
          />
        </div>

        {isLoading ? (
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <Spinner accessibilityLabel="Cargando colecciones" size="large" />
          </div>
        ) : error ? (
          <div style={{ padding: '40px' }}>
            <EmptyState
              fullWidth
              heading="Error al cargar colecciones"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
              <p>No se pudieron cargar las colecciones. Por favor, intenta de nuevo.</p>
            </EmptyState>
          </div>
        ) : filteredCollections && filteredCollections.length > 0 ? (
          <IndexTable
            resourceName={resourceName}
            itemCount={filteredCollections.length}
            headings={[{ title: 'Título' }, { title: 'Estado de la colección' }]}
            selectedItemsCount={selectedResources.length}
            onSelectionChange={(selectionType, toggleType, selection) => {
              if (selectionType === 'all') {
                if (toggleType) {
                  setSelectedResources(filteredCollections?.map((c) => c.id) || []);
                } else {
                  setSelectedResources([]);
                }
              } else if (selectionType === 'page') {
                if (toggleType) {
                  setSelectedResources(filteredCollections?.map((c) => c.id) || []);
                } else {
                  setSelectedResources([]);
                }
              } else if (typeof selection === 'string') {
                if (toggleType) {
                  setSelectedResources((prev) => [...prev, selection]);
                } else {
                  setSelectedResources((prev) => prev.filter((id) => id !== selection));
                }
              }
            }}
            selectable>
            {rowMarkup}
          </IndexTable>
        ) : (
          <div style={{ padding: '40px' }}>
            <EmptyState
              fullWidth
              heading="No hay colecciones"
              action={{
                content: 'Crear colección',
                onAction: () => router.push(routes.store.products.collectionsNew(storeId)),
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
              <p>Crea tu primera colección para organizar tus productos.</p>
            </EmptyState>
          </div>
        )}
      </Card>

      {/* Footer con información adicional */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Text variant="bodySm" tone="subdued" as="p">
          Más información sobre <Link url="#">colecciones</Link>
        </Text>
      </div>
    </div>
  );
}
