import { Plus, ChevronDown, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { handleExportProducts } from '@/app/store/components/product-management/utils/product-utils'
import type { IProduct } from '@/app/store/hooks/useProducts'

interface ProductActionsProps {
  storeId: string
  products: IProduct[]
  selectedProducts: string[]
  handleAddProduct: () => void
  handleDeleteSelected: () => void
}

export function ProductActions({
  storeId,
  products,
  selectedProducts,
  handleAddProduct,
  handleDeleteSelected,
}: ProductActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
      <Button
        variant="outline"
        size="sm"
        className="h-9 text-xs sm:text-sm"
        onClick={() => handleExportProducts(products, selectedProducts)}
      >
        <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="hidden xs:inline">Exportar</span>
      </Button>
      <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm">
        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="hidden xs:inline">Importar</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm">
            <span className="hidden xs:inline">Más acciones</span>
            <span className="inline xs:hidden">Más</span>
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Duplicar seleccionados</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteSelected}>Eliminar seleccionados</DropdownMenuItem>
          <DropdownMenuItem>Actualizar precios</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        size="sm"
        className="h-9 bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] text-xs sm:text-sm"
        onClick={handleAddProduct}
      >
        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="hidden xs:inline">Añadir producto</span>
        <span className="inline xs:hidden">Añadir</span>
      </Button>
    </div>
  )
}
