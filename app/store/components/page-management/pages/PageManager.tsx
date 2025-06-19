import { PageList } from '../components/listing/PageList'
import { PagesPage } from './PagesPage'
import { PageForm } from '../components/PageForm'
import { Loading } from '@shopify/polaris'
import { useState, useCallback } from 'react'
import type { IPage, PageFormValues } from '../types/page-types'

interface PageManagerProps {
  storeId: string
  pageId?: string
  isCreating?: boolean
}

// Hook simulado para páginas (en una implementación real esto vendría de usePages)
function usePages(storeId: string) {
  const [pages] = useState<IPage[]>([])
  const [loading] = useState(false)
  const [error] = useState<Error | null>(null)

  return {
    pages,
    loading,
    error,
    deleteMultiplePages: async (ids: string[]) => {
      console.log('Eliminando páginas:', ids)
      return true
    },
    refreshPages: () => {},
    deletePage: async (id: string) => {
      console.log('Eliminando página:', id)
      return true
    },
    savePage: async (data: PageFormValues, pageId?: string) => {
      console.log('Guardando página:', { data, pageId })
      return true
    },
    getPageById: (id: string): IPage | undefined => {
      return pages.find(page => page.id === id)
    },
  }
}

export function PageManager({ storeId, pageId, isCreating = false }: PageManagerProps) {
  const {
    pages,
    loading,
    error,
    deleteMultiplePages,
    refreshPages,
    deletePage,
    savePage,
    getPageById,
  } = usePages(storeId)

  // Función para navegar de vuelta a la lista
  const handleBackToList = useCallback(() => {
    // En una implementación real, esto sería un router.push() o similar
    console.log('Navegando de vuelta a la lista de páginas')
    window.history.back()
  }, [])

  // Función para guardar página
  const handleSavePage = useCallback(
    async (data: PageFormValues): Promise<boolean> => {
      try {
        const success = await savePage(data, pageId)
        if (success) {
          // Navegar de vuelta a la lista después de guardar
          handleBackToList()
        }
        return success
      } catch (error) {
        console.error('Error al guardar página:', error)
        return false
      }
    },
    [savePage, pageId, handleBackToList]
  )

  // Si estamos creando o editando una página, mostrar el formulario
  if (isCreating || pageId) {
    const initialPage = pageId ? getPageById(pageId) : undefined

    return (
      <PageForm
        storeId={storeId}
        initialPage={initialPage}
        onSave={handleSavePage}
        onCancel={handleBackToList}
        isEditing={!!pageId && !isCreating}
      />
    )
  }

  if (loading) {
    return <Loading />
  }

  return pages.length === 0 && !loading ? (
    <PagesPage />
  ) : (
    <PageList
      storeId={storeId}
      pages={pages}
      loading={loading}
      error={error}
      deleteMultiplePages={deleteMultiplePages}
      refreshPages={refreshPages}
      deletePage={deletePage}
    />
  )
}

export default PageManager
