import type { SortField, VisibleColumns } from '@/app/store/components/checkouts/types/checkout-types';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { Card, IndexTable, useIndexResourceState } from '@shopify/polaris';
import { useState } from 'react';
import { CheckoutTableRow } from '@/app/store/components/checkouts/components/listing/CheckoutTableRow';

interface CheckoutTableDesktopProps {
  checkouts: ICheckoutSession[];
  handleDeleteCheckout: (id: string) => void;
  handleCompleteCheckout: (id: string) => void;
  handleExpireCheckout: (id: string) => void;
  handleCancelCheckout: (id: string) => void;
  handleDeleteSelected: (selectedIds: string[]) => void;
  visibleColumns: VisibleColumns;
  toggleSort: (field: SortField) => void;
  sortDirection: 'ascending' | 'descending';
  sortField: SortField;
  selectedCheckouts: string[];
  handleSelectCheckout: (id: string) => void;
  onViewDetails: (checkout: ICheckoutSession) => void;
}

export function CheckoutTableDesktop({
  checkouts,
  handleDeleteCheckout,
  handleCompleteCheckout,
  handleExpireCheckout,
  handleCancelCheckout,
  handleDeleteSelected,
  visibleColumns,
  toggleSort,
  sortDirection,
  sortField,
  selectedCheckouts: _selectedCheckouts,
  handleSelectCheckout: _handleSelectCheckout,
  onViewDetails,
}: CheckoutTableDesktopProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const resourceName = {
    singular: 'checkout',
    plural: 'checkouts',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(checkouts);

  const promotedBulkActions = [
    {
      content: 'Eliminar checkouts',
      onAction: () => handleDeleteSelected(selectedResources),
    },
  ];

  const rowMarkup = checkouts.map((checkout, index) => {
    const isPopoverActive = activePopover === checkout.id;

    return (
      <CheckoutTableRow
        key={checkout.id}
        checkout={checkout}
        index={index}
        isPopoverActive={isPopoverActive}
        setActivePopover={setActivePopover}
        visibleColumns={visibleColumns}
        selectedResources={selectedResources}
        handleDeleteCheckout={handleDeleteCheckout}
        handleCompleteCheckout={handleCompleteCheckout}
        handleExpireCheckout={handleExpireCheckout}
        handleCancelCheckout={handleCancelCheckout}
        onViewDetails={onViewDetails}
      />
    );
  });

  const headings: { title: string }[] = [{ title: 'Checkout' }];
  const sortableColumns: SortField[] = ['token'];

  if (visibleColumns.status) {
    headings.push({ title: 'Estado' });
    sortableColumns.push('status');
  }
  if (visibleColumns.customer) {
    headings.push({ title: 'Cliente' });
    sortableColumns.push('creationDate');
  }
  if (visibleColumns.total) {
    headings.push({ title: 'Total' });
    sortableColumns.push('totalAmount');
  }
  if (visibleColumns.expiresAt) {
    headings.push({ title: 'Expira' });
    sortableColumns.push('expiresAt');
  }

  const sortColumnIndex = sortableColumns.indexOf(sortField);

  return (
    <div className="hidden sm:block">
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={checkouts.length}
          selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
          headings={headings as [{ title: string }]}
          sortable={[true, true, true, true, true, false]}
          sortDirection={sortDirection}
          sortColumnIndex={sortColumnIndex}
          onSort={(index) => {
            const field = sortableColumns[index];
            if (field) {
              toggleSort(field);
            }
          }}>
          {rowMarkup}
        </IndexTable>
      </Card>
    </div>
  );
}
