import { Search, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface SearchAndFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export default function SearchAndFilters({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: SearchAndFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar archivos"
          className="pl-9"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="px-2">
              {viewMode === 'grid' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewModeChange('grid')}>
              <Grid className="h-4 w-4 mr-2" />
              Cuadrícula
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewModeChange('list')}>
              <List className="h-4 w-4 mr-2" />
              Lista
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
