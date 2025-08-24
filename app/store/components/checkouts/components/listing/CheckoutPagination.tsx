import { Pagination, Select, Text } from '@shopify/polaris';

interface CheckoutPaginationProps {
  currentPage: number;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentItemsCount: number;
}

export function CheckoutPagination({
  currentPage,
  itemsPerPage,
  setItemsPerPage,
  onNext,
  onPrevious,
  hasNextPage,
  hasPreviousPage,
  currentItemsCount,
}: CheckoutPaginationProps) {
  const itemsPerPageOptions = [
    { label: '50', value: '50' },
    { label: '100', value: '100' },
  ];

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = startItem + currentItemsCount - 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
      }}>
      {/* Items info and per-page selector */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
        {currentItemsCount > 0 && (
          <Text variant="bodySm" as="p" tone="subdued">
            Mostrando checkouts del {startItem} al {endItem}
          </Text>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text variant="bodySm" as="span">
            Mostrar:
          </Text>
          <div style={{ minWidth: '80px' }}>
            <Select
              label=""
              labelHidden
              options={itemsPerPageOptions}
              value={itemsPerPage.toString()}
              onChange={(value) => setItemsPerPage(Number.parseInt(value))}
            />
          </div>
        </div>
      </div>

      {/* Pagination controls */}
      <Pagination
        hasPrevious={hasPreviousPage}
        onPrevious={onPrevious}
        hasNext={hasNextPage}
        onNext={onNext}
        label={`Página ${currentPage}`}
      />
    </div>
  );
}
