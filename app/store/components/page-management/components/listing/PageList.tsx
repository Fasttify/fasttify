import { useRouter } from 'next/navigation'
import { Box, Button, ButtonGroup, LegacyCard, Text } from '@shopify/polaris'

// Hooks
import { usePageFilters } from '@/app/store/components/page-management/hooks/usePageFilters'
import { usePageSelection } from '@/app/store/components/page-management/hooks/usePageSelection'
import { routes } from '@/utils/routes'

// Components
import { PageFilters } from '@/app/store/components/page-management/components/listing/page-filters'
import { PageTableDesktop } from '@/app/store/components/page-management/components/listing/page-table-desktop'
import { PageListMobile } from '@/app/store/components/page-management/components/listing/page-list-mobile'
import { PageIcon } from '@shopify/polaris-icons'

// Types
import type { PageListProps } from '@/app/store/components/page-management/types/page-types'

export function PageList({
  storeId,
  pages,
  error,
  deleteMultiplePages,
  deletePage,
}: PageListProps) {
  const router = useRouter()

  // Hooks para manejar diferentes aspectos de la tabla
  const { setSelectedPages } = usePageSelection()
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortedPages,
    toggleSort,
    sortDirection,
    sortField,
  } = usePageFilters(pages)

  // Funciones de navegación y acciones
  const handleAddPage = () => {
    router.push(routes.store.setup.pagesNew(storeId))
  }

  const handleEditPage = (id: string) => {
    router.push(routes.store.setup.pagesEdit(storeId, id))
  }

  const handleDeletePage = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta página?')) {
      deletePage(id)
      setSelectedPages(prev => prev.filter(pageId => pageId !== id))
    }
  }

  const handleDeleteSelected = (selectedIds: string[]) => {
    if (selectedIds.length === 0) return

    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} páginas?`)) {
      deleteMultiplePages(selectedIds)
      setSelectedPages([])
    }
  }

  if (error) {
    return (
      <div className="w-full mt-8">
        <LegacyCard sectioned>
          <Text as="h2" variant="headingMd">
            Error al cargar páginas
          </Text>
          <Text as="p">{error.message}</Text>
          <Box paddingBlockStart="400">
            <Button onClick={handleAddPage}>Crear página</Button>
          </Box>
        </LegacyCard>
      </div>
    )
  }

  return (
    <div className="w-full mt-8">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <PageIcon width={20} height={20} />
            <Text as="h1" variant="headingLg" fontWeight="regular">
              Páginas
            </Text>
          </div>
          <Text as="p" variant="bodyMd" tone="subdued">
            Crea y gestiona las páginas de tu tienda online.
          </Text>
        </div>
        <ButtonGroup>
          <Button variant="primary" onClick={handleAddPage}>
            Crear página
          </Button>
        </ButtonGroup>
      </div>

      <LegacyCard>
        <PageFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <PageTableDesktop
          pages={sortedPages}
          handleEditPage={handleEditPage}
          handleDeletePage={handleDeletePage}
          handleDeleteSelected={handleDeleteSelected}
          visibleColumns={{
            page: true,
            status: true,
            slug: true,
            visibility: true,
            actions: true,
          }}
          toggleSort={toggleSort}
          sortDirection={sortDirection === 'asc' ? 'ascending' : 'descending'}
          sortField={sortField ?? 'title'}
        />

        <PageListMobile
          pages={sortedPages}
          handleEditPage={handleEditPage}
          handleDeletePage={handleDeletePage}
        />

        {/* Información adicional en lugar de paginación */}
        <Box padding="400" background="bg-surface">
          <Text variant="bodySm" as="p" tone="subdued" alignment="center">
            {sortedPages.length === 0
              ? 'No hay páginas que coincidan con los filtros aplicados'
              : `Mostrando ${sortedPages.length} página${sortedPages.length !== 1 ? 's' : ''} de ${pages.length} total${pages.length !== 1 ? 'es' : ''}`}
          </Text>
        </Box>
      </LegacyCard>
    </div>
  )
}
