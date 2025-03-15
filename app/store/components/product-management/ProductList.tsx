import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  ChevronDown,
  Download,
  Upload,
  Eye,
  ListFilter,
  Edit,
  Trash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useProducts } from '@/app/store/hooks/useProducts'
import { toast } from 'sonner'
import { routes } from '@/utils/routes'

interface ProductListProps {
  storeId: string
}

export function ProductList({ storeId }: ProductListProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const {
    products,
    loading,
    error,
    hasNextPage,
    loadNextPage,
    deleteMultipleProducts,
    refreshProducts,
    deleteProduct,
  } = useProducts(storeId)

  // Filtrar productos según la pestaña activa
  const filteredProducts = products
    .filter(product => {
      if (activeTab === 'all') return true
      if (activeTab === 'active') return product.status === 'active'
      if (activeTab === 'draft') return product.status === 'draft'
      if (activeTab === 'archived') return product.status === 'inactive'
      return true
    })
    .filter(product => {
      // Filtrar por búsqueda
      if (!searchQuery) return true
      return (
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id))
    }
  }

  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(productId => productId !== id))
    } else {
      setSelectedProducts([...selectedProducts, id])
    }
  }

  const handleAddProduct = () => {
    router.push(`/store/${storeId}/products/new`)
  }

  const handleEditProduct = (id: string) => {
    router.push(routes.store.products.edit(storeId, id))
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const success = await deleteProduct(id)
      if (success) {
        toast.success('Producto eliminado correctamente')
        setSelectedProducts(prev => prev.filter(productId => productId !== id))
      } else {
        toast.error('Error al eliminar el producto')
      }
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return

    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedProducts.length} productos?`)) {
      const success = await deleteMultipleProducts(selectedProducts)
      if (success) {
        toast.success(`${selectedProducts.length} productos eliminados correctamente`)
        setSelectedProducts([])
      } else {
        toast.error(`Error al eliminar algunos productos`)
      }
    }
  }

  // Formatear el inventario para mostrar
  const formatInventory = (quantity: number) => {
    if (quantity <= 0) return <span className="text-red-500">Sin stock</span>
    if (quantity < 5) return <span className="text-orange-500">{quantity} en stock</span>
    return <span>{quantity} en stock</span>
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border">
      <div className="p-4 sm:p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">Productos</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-9">
              <Upload className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  Más acciones
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicar seleccionados</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteSelected}>
                  Eliminar seleccionados
                </DropdownMenuItem>
                <DropdownMenuItem>Actualizar precios</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              className="h-9 bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
              onClick={handleAddProduct}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir producto
            </Button>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 h-9 p-0">
              <TabsTrigger
                value="all"
                className="px-3 py-1.5 h-9 data-[state=active]:bg-background"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="px-3 py-1.5 h-9 data-[state=active]:bg-background"
              >
                Activo
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="px-3 py-1.5 h-9 data-[state=active]:bg-background"
              >
                Borrador
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="px-3 py-1.5 h-9 data-[state=active]:bg-background"
              >
                Archivado
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-8 h-9 w-full sm:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ListFilter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={refreshProducts}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {error && (
            <div className="py-8 text-center text-red-500">
              Error al cargar productos: {error.message}
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No se encontraron productos.{' '}
              <Button variant="link" onClick={handleAddProduct} className="p-0 h-auto text-black">
                Añadir un producto
              </Button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="py-3 px-4 text-left font-medium w-10">
                    <Checkbox
                      checked={
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all products"
                    />
                  </th>
                  <th className="py-3 px-4 text-left font-medium">Producto</th>
                  <th className="py-3 px-4 text-left font-medium">Estado</th>
                  <th className="py-3 px-4 text-left font-medium">Inventario</th>
                  <th className="py-3 px-4 text-left font-medium">Precio</th>
                  <th className="py-3 px-4 text-left font-medium">Categoría</th>
                  <th className="py-3 px-4 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        {product.images && product.images.length > 0 ? (
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
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Eye className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        {product.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {product.status === 'active' && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800">
                          Activo
                        </Badge>
                      )}
                      {product.status === 'draft' && <Badge variant="outline">Borrador</Badge>}
                      {product.status === 'inactive' && (
                        <Badge variant="secondary">Archivado</Badge>
                      )}
                      {product.status === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ">
                          Pendiente
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">{formatInventory(product.quantity)}</td>
                    <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                    <td className="py-3 px-4">{product.category || 'Sin categoría'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditProduct(product.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 "
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {hasNextPage && (
            <div className="mt-4 text-center">
              <Button
                className="text-black"
                variant="link"
                onClick={loadNextPage}
                disabled={loading}
              >
                Cargar más productos
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
