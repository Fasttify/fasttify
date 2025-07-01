import { useState } from 'react'
import type { Page } from '@/app/store/components/page-management/types/page-types'

export function usePageSelection() {
  const [selectedPages, setSelectedPages] = useState<string[]>([])

  const handleSelectAll = (pages: Page[]) => {
    if (selectedPages.length === pages.length) {
      setSelectedPages([])
    } else {
      setSelectedPages(pages.map(page => page.id))
    }
  }

  const handleSelectPage = (id: string) => {
    if (selectedPages.includes(id)) {
      setSelectedPages(selectedPages.filter(pageId => pageId !== id))
    } else {
      setSelectedPages([...selectedPages, id])
    }
  }

  return {
    selectedPages,
    setSelectedPages,
    handleSelectAll,
    handleSelectPage,
  }
}
