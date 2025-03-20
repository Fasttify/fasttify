import { useState, useEffect, useRef } from 'react'

export function useProductPagination({
  sortedProducts,
  hasNextPage,
  loadNextPage,
}: {
  sortedProducts: any[]
  hasNextPage: boolean
  loadNextPage: () => void
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false)
  const prevProductsLength = useRef(sortedProducts.length)

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Función para manejar el cambio de página
  const handlePageChange = (newPage: number) => {
    // Si estamos intentando ir a la siguiente página y estamos en la última página actual
    if (newPage > currentPage && newPage > totalPages && hasNextPage) {
      // Indicar que estamos cargando más productos
      setLoadingMoreProducts(true)

      // Cargar más productos
      loadNextPage()

      // No cambiamos la página actual aquí, se actualizará cuando lleguen los nuevos productos
    } else if (newPage <= totalPages) {
      // Cambiar a la página solicitada si está dentro del rango
      setCurrentPage(newPage)
    }
  }

  // Detectar cuando se cargan nuevos productos
  useEffect(() => {
    if (sortedProducts.length > prevProductsLength.current && loadingMoreProducts) {
      // Se han cargado nuevos productos, calculamos la nueva página

      // Avanzamos a la siguiente página
      setCurrentPage(currentPage + 1)

      // Resetear el estado de carga
      setLoadingMoreProducts(false)

      prevProductsLength.current = sortedProducts.length
    } else {
      prevProductsLength.current = sortedProducts.length
    }
  }, [sortedProducts, loadingMoreProducts, currentPage])

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedProducts,
    loadingMoreProducts,
    handlePageChange,
  }
}
