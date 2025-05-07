import { useState, useEffect } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchInput } from '@/app/store/components/product-management/collection-form/search-input'
import { useProducts, IProduct } from '@/app/store/hooks/useProducts'
import useStoreDataStore from '@/zustand-states/storeDataStore'

interface ProductSectionProps {
  selectedProducts: IProduct[]
  onAddProduct: (product: IProduct) => void
  onRemoveProduct: (productId: string) => void
}

export function ProductSection({
  selectedProducts = [],
  onAddProduct,
  onRemoveProduct,
}: ProductSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('mas-recientes')
  const { storeId } = useStoreDataStore()

  const { products, loading } = useProducts(storeId ?? undefined, {
    limit: 100,
    sortDirection: 'DESC',
    sortField: 'createdAt',
  })

  // Estado para los productos seleccionados en el diálogo
  const [dialogSelectedProducts, setDialogSelectedProducts] = useState<string[]>([])

  // Inicializar los productos seleccionados en el diálogo
  useEffect(() => {
    if (isDialogOpen) {
      setDialogSelectedProducts(selectedProducts.map(p => p.id))
    }
  }, [isDialogOpen])

  // Filtrar productos basados en el término de búsqueda
  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.status === 'active'
  )

  // Ordenar productos según la opción seleccionada
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'mas-recientes':
        // Ordenar por fecha de creación descendente (más recientes primero)
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      case 'mas-antiguos':
        // Ordenar por fecha de creación ascendente (más antiguos primero)
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      case 'precio-mayor':
        // Ordenar por precio descendente (mayor precio primero)
        return (b.price || 0) - (a.price || 0)
      case 'precio-menor':
        // Ordenar por precio ascendente (menor precio primero)
        return (a.price || 0) - (b.price || 0)
      default:
        return 0
    }
  })

  // Manejar la selección de productos en el diálogo
  const handleProductSelect = (productId: string) => {
    setDialogSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  // Confirmar la selección de productos
  const handleConfirmSelection = () => {
    // Crear un conjunto de IDs de productos actualmente seleccionados
    const currentSelectedIds = new Set(selectedProducts.map(p => p.id))

    // Añadir productos nuevos (los que están en dialogSelectedProducts pero no en currentSelectedIds)
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

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-medium mb-4">Productos</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <SearchInput
            placeholder="Buscar productos"
            className="flex-grow"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSearchChange(e.target.value)
            }
          />
          <Button
            variant="outline"
            className="border-gray-300 whitespace-nowrap"
            onClick={() => setIsDialogOpen(true)}
          >
            Explorar
          </Button>
          <div className="relative">
            <Select value={sortOption} onValueChange={value => setSortOption(value)}>
              <SelectTrigger className="border-gray-300 w-full sm:w-[180px]">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mas-recientes">Más recientes</SelectItem>
                <SelectItem value="mas-antiguos">Más antiguos</SelectItem>
                <SelectItem value="precio-mayor">Mayor precio</SelectItem>
                <SelectItem value="precio-menor">Menor precio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="space-y-2">
            {selectedProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center border border-gray-200 rounded-md p-2"
              >
                <div className="flex-shrink-0 mr-2 text-sm text-gray-500">{index + 1}.</div>
                <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden mr-2">
                  {product.images &&
                  (Array.isArray(product.images)
                    ? product.images.length > 0
                    : typeof product.images === 'string' &&
                      product.images !== '[]' &&
                      product.images !== '') ? (
                    <img
                      src={
                        typeof product.images === 'string'
                          ? JSON.parse(product.images)[0]?.url
                          : product.images[0]?.url
                      }
                      alt={product.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-grow text-sm">{product.name}</div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    {product.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => {
                      onRemoveProduct(product.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay productos seleccionados</p>
            <Button variant="outline" className="mt-2" onClick={() => setIsDialogOpen(true)}>
              Añadir productos
            </Button>
          </div>
        )}
      </div>

      {/* Product Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleccionar productos</DialogTitle>
          </DialogHeader>
          <div className="relative my-4">
            <SearchInput
              placeholder="Buscar productos"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
            />
          </div>

          {loading ? (
            <div className="py-4 text-center">Cargando productos...</div>
          ) : sortedProducts.length === 0 ? (
            <div className="py-4 text-center">No se encontraron productos</div>
          ) : (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {sortedProducts.map(product => (
                <div key={product.id} className="flex items-center py-2 border-b">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={dialogSelectedProducts.includes(product.id)}
                    onCheckedChange={() => handleProductSelect(product.id)}
                    className="mr-2"
                  />
                  <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden mr-2">
                    {product.images &&
                    (Array.isArray(product.images)
                      ? product.images.length > 0
                      : typeof product.images === 'string' &&
                        product.images !== '[]' &&
                        product.images !== '') ? (
                      <img
                        src={
                          typeof product.images === 'string'
                            ? JSON.parse(product.images)[0]?.url
                            : product.images[0]?.url
                        }
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor={`product-${product.id}`}
                    className="text-sm flex-grow cursor-pointer"
                  >
                    {product.name}
                    <div className="text-xs text-gray-500">
                      {product.price !== null && product.price !== undefined
                        ? `$${Number(product.price).toLocaleString('es-CO', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}`
                        : '$0'}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
              onClick={handleConfirmSelection}
              disabled={loading}
            >
              Confirmar selección
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
