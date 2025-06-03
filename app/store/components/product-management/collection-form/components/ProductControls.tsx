import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchInput } from '@/app/store/components/product-management/collection-form/search-input'
import type { SortOption } from '@/app/store/components/product-management/collection-form/types/productTypes'

interface ProductControlsProps {
  searchTerm: string
  sortOption: SortOption
  onSearchChange: (value: string) => void
  onSortChange: (value: SortOption) => void
  onOpenDialog: () => void
}

export function ProductControls({
  searchTerm,
  sortOption,
  onSearchChange,
  onSortChange,
  onOpenDialog,
}: ProductControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <SearchInput
        placeholder="Buscar productos"
        className="flex-grow"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
      />
      <Button
        variant="outline"
        className="border-gray-300 whitespace-nowrap"
        onClick={onOpenDialog}
      >
        Explorar
      </Button>
      <div className="relative">
        <Select value={sortOption} onValueChange={onSortChange}>
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
  )
}
