import { Search, ListFilter, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import type { VisibleColumns } from '@/app/store/components/product-management/types/product-types'

interface ProductFiltersProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  visibleColumns: VisibleColumns
  setVisibleColumns: (columns: VisibleColumns) => void
  refreshProducts: () => void
}

export function ProductFilters({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  visibleColumns,
  setVisibleColumns,
  refreshProducts,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        <Tabs defaultValue={activeTab} className="w-full sm:w-auto" onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 h-9 p-0 w-full sm:w-auto">
            <TabsTrigger
              value="all"
              className="px-2 sm:px-3 py-1.5 h-9 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="px-2 sm:px-3 py-1.5 h-9 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              Activo
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              className="px-2 sm:px-3 py-1.5 h-9 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              Borrador
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="px-2 sm:px-3 py-1.5 h-9 text-xs sm:text-sm data-[state=active]:bg-background"
            >
              Archivado
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <div className="relative flex-grow sm:flex-grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8 h-9 w-full sm:w-[200px] lg:w-[300px]"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
              <ListFilter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Columnas visibles</p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={visibleColumns.status}
                    onCheckedChange={checked =>
                      setVisibleColumns({ ...visibleColumns, status: !!checked })
                    }
                  />
                  Estado
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={visibleColumns.inventory}
                    onCheckedChange={checked =>
                      setVisibleColumns({ ...visibleColumns, inventory: !!checked })
                    }
                  />
                  Inventario
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={visibleColumns.price}
                    onCheckedChange={checked =>
                      setVisibleColumns({ ...visibleColumns, price: !!checked })
                    }
                  />
                  Precio
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={visibleColumns.category}
                    onCheckedChange={checked =>
                      setVisibleColumns({ ...visibleColumns, category: !!checked })
                    }
                  />
                  Categoría
                </label>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={refreshProducts}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
