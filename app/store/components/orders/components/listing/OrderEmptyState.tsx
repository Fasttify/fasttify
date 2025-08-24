import { Card, EmptyState } from '@shopify/polaris';

interface OrderEmptyStateProps {
  error: Error | null;
}

export function OrderEmptyState({ error }: OrderEmptyStateProps) {
  if (error) {
    return (
      <div className="w-full mt-8">
        <Card>
          <EmptyState
            heading="Error al cargar órdenes"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
            <p>Error al cargar órdenes: {error.message}</p>
          </EmptyState>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mt-8">
      <Card>
        <EmptyState
          heading="No hay órdenes"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
          <p>No se han encontrado órdenes en tu tienda.</p>
        </EmptyState>
      </Card>
    </div>
  );
}
