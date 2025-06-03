'use client'

import { MoreHorizontal, ExternalLink, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import useStoreDataStore from '@/context/core/storeDataStore'
import { routes } from '@/utils/routes'
import { useParams, usePathname } from 'next/navigation'
import { getStoreId } from '@/utils/store-utils'

interface AppItem {
  name: string
  url: string
  icon: string | LucideIcon
  isActive: boolean
}

import { useRouter } from 'next/navigation'

export function NavApps() {
  const { isMobile } = useSidebar()
  const { hasMasterShopApiKey } = useStoreDataStore()
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  const router = useRouter()

  const availableApps: AppItem[] = [
    {
      name: 'Master Shop',
      url: `${routes.store.masterShop(storeId)}`,
      icon: '/svgs/mastershop-svg.svg',
      isActive: hasMasterShopApiKey,
    },
    // Añadir más apps aquí cuando estén disponibles
  ]

  // Filtrar para mostrar solo apps activas
  const activeApps = availableApps.filter(app => app.isActive)

  // Función para manejar la navegación
  const handleAppNavigation = (app: AppItem) => {
    if (app.isActive) {
      router.push(app.url)
    } else {
      // Si la app no está activa, redirigir a la página de configuración de apps
      router.push(routes.store.setup.apps(storeId))
    }
  }

  // Si no hay apps activas, no renderizar el componente
  if (activeApps.length === 0) {
    return null
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Apps Activas</SidebarGroupLabel>
      <SidebarMenu>
        {activeApps.map(app => (
          <SidebarMenuItem key={app.name}>
            <SidebarMenuButton onClick={() => handleAppNavigation(app)}>
              {typeof app.icon === 'string' ? (
                <div className="relative h-5 w-5 mr-2">
                  <Image src={app.icon} alt={app.name} fill className="object-contain" />
                </div>
              ) : (
                <app.icon />
              )}
              <span>{app.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem>
                  <ExternalLink className="text-muted-foreground" />
                  <span>Abrir App</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Configurar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
