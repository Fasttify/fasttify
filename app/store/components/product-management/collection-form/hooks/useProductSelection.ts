import { useState, useEffect, useMemo } from 'react'
import { IProduct } from '@/app/store/components/product-management/collection-form/types/productTypes'
import type { SortOption } from '@/app/store/components/product-management/collection-form/types/productTypes'
import {
  filterProducts,
  sortProducts,
} from '@/app/store/components/product-management/collection-form/utils/productUtils'

interface UseProductSelectionProps {
  products: IProduct[]
  selectedProducts: IProduct[]
  onAddProduct: (product: IProduct) => void
  onRemoveProduct: (productId: string) => void
}

export const useProductSelection = ({
  products,
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
}: UseProductSelectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('mas-recientes')
  const [dialogSelectedProducts, setDialogSelectedProducts] = useState<string[]>([])

  // Inicializar productos seleccionados en el diálogo cuando se abre
  useEffect(() => {
    if (isDialogOpen) {
      setDialogSelectedProducts(selectedProducts.map(p => p.id))
    }
  }, [isDialogOpen, selectedProducts])

  // Filtrar y ordenar productos
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = filterProducts(products, searchTerm)
    return sortProducts(filtered, sortOption)
  }, [products, searchTerm, sortOption])

  // Manejar selección de productos en el diálogo
  const handleProductSelect = (productId: string) => {
    setDialogSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  // Confirmar selección de productos
  const handleConfirmSelection = () => {
    const currentSelectedIds = new Set(selectedProducts.map(p => p.id))

    // Añadir productos nuevos
    dialogSelectedProducts.forEach(productId => {
      if (!currentSelectedIds.has(productId)) {
        const product = products.find(p => p.id === productId)
        if (product) {
          onAddProduct(product)
        }
      }
    })

    // Eliminar productos que ya no están seleccionados
    selectedProducts.forEach(product => {
      if (!dialogSelectedProducts.includes(product.id)) {
        onRemoveProduct(product.id)
      }
    })

    setIsDialogOpen(false)
  }

  const openDialog = () => setIsDialogOpen(true)
  const closeDialog = () => setIsDialogOpen(false)

  return {
    // Estados
    isDialogOpen,
    searchTerm,
    sortOption,
    dialogSelectedProducts,
    filteredAndSortedProducts,

    // Funciones
    setSearchTerm,
    setSortOption,
    handleProductSelect,
    handleConfirmSelection,
    openDialog,
    closeDialog,
  }
}
