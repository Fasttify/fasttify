import { Button } from '@/components/ui/button'

interface ProductEmptyStateProps {
  handleAddProduct: () => void
  error: Error | null
}

export function ProductEmptyState({ handleAddProduct, error }: ProductEmptyStateProps) {
  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Error al cargar productos: {error.message}
      </div>
    )
  }

  return (
    <div className="py-8 text-center text-gray-500">
      No se encontraron productos.{' '}
      <Button variant="link" onClick={handleAddProduct} className="p-0 h-auto text-black">
        Añadir un producto
      </Button>
    </div>
  )
}
