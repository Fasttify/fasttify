import type { PageSummary, SortField, VisibleColumns } from '@/app/store/components/page-management/types/page-types';
import {
  formatDate,
  formatVisibility,
  getStatusText,
  getStatusTone,
  getVisibilityTone,
} from '@/app/store/components/page-management/utils/page-utils';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  IndexTable,
  Link as PolarisLink,
  Text,
  useIndexResourceState,
} from '@shopify/polaris';
import { DeleteIcon, EditIcon, PageIcon } from '@shopify/polaris-icons';

interface PageTableDesktopProps {
  pages: PageSummary[];
  handleEditPage: (id: string) => void;
  handleDeletePage: (id: string) => void;
  handleDeleteSelected: (selectedIds: string[]) => void;
  visibleColumns: VisibleColumns;
  toggleSort: (field: SortField) => void;
  sortDirection: 'ascending' | 'descending';
  sortField: SortField;
}

export function PageTableDesktop({
  pages,
  handleEditPage,
  handleDeletePage,
  handleDeleteSelected,
  visibleColumns,
  toggleSort,
  sortDirection,
  sortField,
}: PageTableDesktopProps) {
  const resourceName = {
    singular: 'página',
    plural: 'páginas',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(pages);

  const showActionsColumn = visibleColumns.actions && selectedResources.length > 0;

  const promotedBulkActions = [
    {
      content: 'Eliminar páginas',
      onAction: () => handleDeleteSelected(selectedResources),
    },
  ];

  const rowMarkup = pages.map(({ id, title, slug, status, isVisible, createdAt, pageType }, index) => {
    return (
      <IndexTable.Row id={id} key={id} selected={selectedResources.includes(id)} position={index}>
        <IndexTable.Cell>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PageIcon width={22} height={22} />
            <div>
              <PolarisLink onClick={() => handleEditPage(id)}>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                  {title}
                </Text>
              </PolarisLink>
            </div>
          </div>
        </IndexTable.Cell>
        {visibleColumns.status && (
          <IndexTable.Cell>
            <Badge tone={getStatusTone(status)}>{getStatusText(status)}</Badge>
          </IndexTable.Cell>
        )}
        {visibleColumns.slug && (
          <IndexTable.Cell>
            <Text variant="bodyMd" as="span">
              /{slug}
            </Text>
          </IndexTable.Cell>
        )}
        {visibleColumns.visibility && (
          <IndexTable.Cell>
            <Badge tone={getVisibilityTone(isVisible)}>{formatVisibility(isVisible)}</Badge>
          </IndexTable.Cell>
        )}
        <IndexTable.Cell>{pageType === 'policies' ? 'Política' : 'Estándar'}</IndexTable.Cell>
        <IndexTable.Cell>{formatDate(createdAt)}</IndexTable.Cell>
        {showActionsColumn && (
          <IndexTable.Cell>
            <ButtonGroup>
              <Button icon={EditIcon} onClick={() => handleEditPage(id)} accessibilityLabel="Editar página" />
              <Button
                icon={DeleteIcon}
                onClick={() => handleDeletePage(id)}
                accessibilityLabel="Eliminar página"
                tone="critical"
              />
            </ButtonGroup>
          </IndexTable.Cell>
        )}
      </IndexTable.Row>
    );
  });

  const headings: { title: string }[] = [{ title: 'Página' }];
  const sortableColumns: SortField[] = ['title'];

  if (visibleColumns.status) {
    headings.push({ title: 'Estado' });
    sortableColumns.push('status');
  }
  if (visibleColumns.slug) {
    headings.push({ title: 'URL' });
    sortableColumns.push('slug');
  }
  if (visibleColumns.visibility) {
    headings.push({ title: 'Visibilidad' });
  }
  headings.push({ title: 'Tipo' });
  sortableColumns.push('pageType');
  headings.push({ title: 'Fecha de creación' });
  sortableColumns.push('createdAt');
  if (showActionsColumn) {
    headings.push({ title: 'Acciones' });
    // No agregues nada a sortableColumns porque la columna de acciones no es ordenable
  }

  const sortColumnIndex = sortableColumns.indexOf(sortField);

  return (
    <div className="hidden sm:block">
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={pages.length}
          selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
          headings={headings as [{ title: string }]}
          sortable={[true, true, true, false, true, true, false]}
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
