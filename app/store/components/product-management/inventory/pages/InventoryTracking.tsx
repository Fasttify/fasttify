import InventoryActions from '@/app/store/components/product-management/inventory/components/InventoryActions';
import InventoryFilter from '@/app/store/components/product-management/inventory/components/InventoryFilter';
import InventoryFooter from '@/app/store/components/product-management/inventory/components/InventoryFooter';
import InventoryHeader from '@/app/store/components/product-management/inventory/components/InventoryHeader';
import InventoryTable, {
  InventoryRowProps,
} from '@/app/store/components/product-management/inventory/components/InventoryTable';
import { ProductPagination } from '@/app/store/components/product-management/products/components/listing/ProductPagination';
import { routes } from '@/utils/client/routes';
import { getStoreId } from '@/utils/client/store-utils';
import { Button, Card, EmptyState, Spinner } from '@shopify/polaris';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CustomContextualSaveBar } from '@/app/store/components/product-management/products/components/form/ContextualSaveBar';
import { useProducts } from '@/app/store/hooks/data/useProducts';
import { useToast } from '@/app/store/context/ToastContext';

interface InventoryTrackingProps {
  data: InventoryRowProps[];
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  refreshInventory: () => void;
  currentPage: number;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
}

export function InventoryTracking({
  data,
  loading,
  error,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  currentPage,
  itemsPerPage,
  setItemsPerPage,
}: InventoryTrackingProps) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const storeId = getStoreId(params, pathname);
  const [searchQuery, setSearchQuery] = useState('');

  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateProduct } = useProducts(storeId);
  const { showToast } = useToast();

  const handleQuantityChange = (productId: string, value: number) => {
    setEditedQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updates = Object.entries(editedQuantities).map(([productId, quantity]) =>
        updateProduct({
          id: productId,
          quantity: quantity,
        })
      );
      await Promise.all(updates);
      showToast('Inventario actualizado correctamente');
      setEditedQuantities({});
      setIsDirty(false);
    } catch (e) {
      showToast('Error al actualizar el inventario', true);
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setEditedQuantities({});
    setIsDirty(false);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spinner accessibilityLabel="Cargando inventario" size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <EmptyState
          heading="Error al cargar el inventario"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          fullWidth>
          <p>Ha ocurrido un error al cargar los datos del inventario.</p>
        </EmptyState>
      </Card>
    );
  }

  if (data.length === 0 && !hasPreviousPage) {
    return (
      <>
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center justify-between mb-6">
            <InventoryHeader />
          </div>
        </div>
        <Card>
          <EmptyState
            heading="Sin productos en inventario"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            fullWidth>
            <p>No hay productos disponibles en el inventario.</p>
            <Button variant="primary" onClick={() => router.push(routes.store.products.main(storeId))}>
              Ir a productos
            </Button>
          </EmptyState>
        </Card>
      </>
    );
  }

  return (
    <div className="w-full mt-8">
      <CustomContextualSaveBar
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onSave={handleSave}
        onDiscard={handleDiscard}
        router={router}
      />
      {/* Custom Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <InventoryHeader />
        </div>
        <InventoryActions />
      </div>

      <Card>
        <div style={{ padding: 16 }}>
          <InventoryFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        <InventoryTable
          data={filteredData}
          editedQuantities={editedQuantities}
          onQuantityChange={handleQuantityChange}
        />

        {!loading && !error && (filteredData.length > 0 || hasPreviousPage) && (
          <div style={{ padding: 16 }}>
            <ProductPagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              onNext={nextPage}
              onPrevious={previousPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              currentItemsCount={filteredData.length}
            />
          </div>
        )}

        <div style={{ padding: 16 }}>
          <InventoryFooter />
        </div>
      </Card>
    </div>
  );
}
