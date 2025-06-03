'use client'

import * as React from 'react'
import { useRouter, usePathname, useParams } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStoreId } from '@/utils/store-utils'
import { generateSearchRoutes } from '@/app/store/components/search-bar/components/SearchRoutes'

export function SearchNavigation({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const storeId = getStoreId(params, pathname)

  // Generar rutas de búsqueda usando la función del archivo separado
  const searchRoutes = React.useMemo(() => {
    return storeId ? generateSearchRoutes(storeId) : []
  }, [storeId])

  // Handle keyboard shortcut to open search
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Filter routes based on search input
  const filteredRoutes = React.useMemo(() => {
    if (!search) return searchRoutes

    return searchRoutes.filter(route => {
      return (
        route.label.toLowerCase().includes(search.toLowerCase()) ||
        route.path.toLowerCase().includes(search.toLowerCase()) ||
        route.keywords?.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
      )
    })
  }, [search, searchRoutes])

  // Handle route selection
  const onSelect = React.useCallback(
    (path: string) => {
      setOpen(false)
      router.push(path)
    },
    [router]
  )

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-9 w-full justify-start rounded-md bg-[#2a2a2a] border-[#3a3a3a] text-gray-300 px-3',
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="flex-1 text-left">Buscar...</span>
        <div className="flex items-center text-xs text-gray-300">
          <kbd className="px-1 py-0.5 rounded bg-[#3a3a3a] text-[10px]">CTRL</kbd>
          <kbd className="ml-1 px-1 py-0.5 rounded bg-[#3a3a3a] text-[10px]">K</kbd>
        </div>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar rutas y páginas..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>

          <CommandGroup heading="Navegación">
            {filteredRoutes.map(route => (
              <CommandItem
                key={route.path}
                value={route.path}
                onSelect={() => onSelect(route.path)}
                className={cn(
                  'flex items-center',
                  pathname === route.path && 'bg-accent text-accent-foreground'
                )}
              >
                {route.icon && React.createElement(route.icon, { className: 'mr-2 h-4 w-4' })}
                <span>{route.label}</span>
                {route.section && (
                  <span className="ml-auto text-xs text-muted-foreground">{route.section}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
