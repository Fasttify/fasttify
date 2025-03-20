import { useState, useEffect } from 'react'
import type { VisibleColumns } from '@/app/store/components/product-management/types/product-types'

export function useResponsiveColumns() {
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    product: true,
    status: true,
    inventory: true,
    price: true,
    category: true,
    actions: true,
  })

  // Adjust visible columns based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleColumns({
          product: true,
          status: true,
          inventory: false,
          price: true,
          category: false,
          actions: true,
        })
      } else if (window.innerWidth < 768) {
        setVisibleColumns({
          product: true,
          status: true,
          inventory: true,
          price: true,
          category: false,
          actions: true,
        })
      } else {
        setVisibleColumns({
          product: true,
          status: true,
          inventory: true,
          price: true,
          category: true,
          actions: true,
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    visibleColumns,
    setVisibleColumns,
  }
}
