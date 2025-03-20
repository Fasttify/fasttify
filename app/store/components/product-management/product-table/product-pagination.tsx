import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductPaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  setItemsPerPage: (value: number) => void
  handlePageChange: (page: number) => void
  totalItems: number
  loadingMoreProducts: boolean
  hasNextPage: boolean
}

export function ProductPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  handlePageChange,
  totalItems,
  loadingMoreProducts,
  hasNextPage,
}: ProductPaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} productos
        </p>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={value => setItemsPerPage(Number.parseInt(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Página anterior</span>
        </Button>
        <span className="text-sm mx-2">
          Página {currentPage} de {totalPages || 1}
          {hasNextPage && currentPage === totalPages ? '+' : ''}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={(!hasNextPage && currentPage === totalPages) || loadingMoreProducts}
        >
          {loadingMoreProducts ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="sr-only">Página siguiente</span>
        </Button>
      </div>
    </div>
  )
}
