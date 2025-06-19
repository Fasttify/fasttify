import { useState } from 'react'
import type { IPage } from '../types/page-types'

export function usePageSelection() {
  const [selectedPages, setSelectedPages] = useState<string[]>([])

  const handleSelectAll = (pages: IPage[]) => {
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
