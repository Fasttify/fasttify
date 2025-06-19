import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Badge,
  Button,
  ButtonGroup,
  Link as PolarisLink,
} from '@shopify/polaris'
import { EditIcon, DeleteIcon, PageIcon } from '@shopify/polaris-icons'
import type { IPage, SortField, VisibleColumns } from '../../types/page-types'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import {
  getStatusText,
  getStatusTone,
  formatDate,
  formatVisibility,
  getVisibilityTone,
  truncateContent,
} from '../../utils/page-utils'

interface PageTableDesktopProps {
  pages: IPage[]
  handleEditPage: (id: string) => void
  handleDeletePage: (id: string) => void
  handleDeleteSelected: (selectedIds: string[]) => void
  visibleColumns: VisibleColumns
  toggleSort: (field: SortField) => void
  sortDirection: 'ascending' | 'descending'
  sortField: SortField
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
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)

  const resourceName = {
    singular: 'página',
    plural: 'páginas',
  }

  // Mapear páginas para que sean compatibles con useIndexResourceState
  const mappedPages = pages.map(page => ({
    ...page,
    [page.id]: page.id, // Añadir índice dinámico para compatibilidad
  }))

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(mappedPages)

  const promotedBulkActions = [
    {
      content: 'Eliminar páginas',
      onAction: () => handleDeleteSelected(selectedResources),
    },
  ]

  const rowMarkup = pages.map(
    ({ id, title, slug, status, isVisible, content, createdAt }, index) => {
      return (
        <IndexTable.Row id={id} key={id} selected={selectedResources.includes(id)} position={index}>
          <IndexTable.Cell>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PageIcon />
              <div>
                <PolarisLink url={`/store/${storeId}/pages/${id}/edit`}>
                  <Text variant="bodyMd" fontWeight="bold" as="span">
                    {title}
                  </Text>
                </PolarisLink>
                <div>
                  <Text variant="bodySm" tone="subdued" as="p">
                    {truncateContent(content)}
                  </Text>
                </div>
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
          <IndexTable.Cell>{formatDate(createdAt)}</IndexTable.Cell>
          {visibleColumns.actions && (
            <IndexTable.Cell>
              <ButtonGroup>
                <Button
                  icon={EditIcon}
                  onClick={() => handleEditPage(id)}
                  accessibilityLabel="Editar página"
                />
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
      )
    }
  )

  const headings: { title: string }[] = [{ title: 'Página' }]
  const sortableColumns: SortField[] = ['title']

  if (visibleColumns.status) {
    headings.push({ title: 'Estado' })
    sortableColumns.push('status')
  }
  if (visibleColumns.slug) {
    headings.push({ title: 'URL' })
    sortableColumns.push('slug')
  }
  if (visibleColumns.visibility) {
    headings.push({ title: 'Visibilidad' })
  }
  headings.push({ title: 'Fecha de creación' })
  sortableColumns.push('createdAt')
  if (visibleColumns.actions) {
    headings.push({ title: 'Acciones' })
  }

  const sortColumnIndex = sortableColumns.indexOf(sortField)

  return (
    <div className="hidden sm:block">
      <LegacyCard>
        <IndexTable
          resourceName={resourceName}
          itemCount={pages.length}
          selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
          headings={headings as [{ title: string }]}
          sortable={[true, true, true, false, true, false]}
          sortDirection={sortDirection}
          sortColumnIndex={sortColumnIndex}
          onSort={index => {
            const field = sortableColumns[index]
            if (field) {
              toggleSort(field)
            }
          }}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
    </div>
  )
}
