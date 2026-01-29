import { Card, EmptyState } from '@shopify/polaris';

interface CheckoutEmptyStateProps {
  error: Error | null;
}

export function CheckoutEmptyState({ error }: CheckoutEmptyStateProps) {
  if (error) {
    return (
      <div className="w-full mt-8">
        <Card>
          <EmptyState
            heading="Error al cargar checkouts"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
            <p>Error al cargar checkouts: {error.message}</p>
          </EmptyState>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mt-8">
      <Card>
        <EmptyState
          heading="No hay checkouts"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
          <p>No se han encontrado sesiones de checkout en tu tienda.</p>
        </EmptyState>
      </Card>
    </div>
  );
}
