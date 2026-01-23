import { Card, EmptyState } from '@shopify/polaris';

interface ProductEmptyStateProps {
  handleAddProduct: () => void;
  error: Error | null;
}

export function ProductEmptyState({ handleAddProduct, error }: ProductEmptyStateProps) {
  if (error) {
    return (
      <div className="w-full mt-8">
        <Card>
          <EmptyState
            heading="Error al cargar productos"
            action={{ content: 'Añadir producto', onAction: handleAddProduct }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
            <p>Error al cargar productos: {error.message}</p>
          </EmptyState>
        </Card>
      </div>
    );
  }
}
