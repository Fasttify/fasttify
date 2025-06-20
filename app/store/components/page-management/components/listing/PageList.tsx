import { useRouter } from 'next/navigation'
import { Box, Button, ButtonGroup, LegacyCard, Text } from '@shopify/polaris'

// Hooks
import { usePageFilters } from '../../hooks/usePageFilters'
import { usePageSelection } from '../../hooks/usePageSelection'

// Components
import { PageFilters } from './page-filters'
import { PageTableDesktop } from './page-table-desktop'
import { PageIcon } from '@shopify/polaris-icons'
import { useToast } from '@/app/store/context/ToastContext'

// Types
import type { PageListProps } from '../../types/page-types'

export function PageList({
  storeId,
  pages,
  error,
  deleteMultiplePages,
  deletePage,
}: PageListProps) {
  const router = useRouter()
  const { showToast } = useToast()

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
    router.push(`/store/${storeId}/pages/new`)
  }

  const handleEditPage = (id: string) => {
    router.push(`/store/${storeId}/pages/${id}/edit`)
  }

  const handleDeletePage = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta página?')) {
      const success = await deletePage(id)
      if (success) {
        showToast('Página eliminada correctamente')
        setSelectedPages(prev => prev.filter(pageId => pageId !== id))
      } else {
        showToast('Error al eliminar la página', true)
      }
    }
  }

  const handleDeleteSelected = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return

    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} páginas?`)) {
      const success = await deleteMultiplePages(selectedIds)
      if (success) {
        showToast(`${selectedIds.length} páginas eliminadas correctamente`)
        setSelectedPages([])
      } else {
        showToast('Error al eliminar algunas páginas', true)
      }
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
          <Button onClick={() => console.log('Importar páginas')}>Importar</Button>
          <Button onClick={() => console.log('Exportar páginas')}>Exportar</Button>
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
