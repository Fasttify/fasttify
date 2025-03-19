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
import useStoreDataStore from '@/zustand-states/storeDataStore'
import { routes } from '@/utils/routes'
import { useParams, usePathname } from 'next/navigation'
import { getStoreId } from '@/utils/store-utils'

interface AppItem {
  name: string
  url: string
  icon: string | LucideIcon
  isActive: boolean
}

export function NavApps() {
  const { isMobile } = useSidebar()
  const { hasMasterShopApiKey } = useStoreDataStore()
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)

  // Define available apps
  const availableApps: AppItem[] = [
    {
      name: 'Master Shop',
      url: routes.store.setup.apps(storeId),
      icon: '/svgs/mastershop-svg.svg',
      isActive: hasMasterShopApiKey,
    },
    // Add more apps here as they become available
  ]

  // Filter to only show active apps
  const activeApps = availableApps.filter(app => app.isActive)

  // If no active apps, don't render the component
  if (activeApps.length === 0) {
    return null
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Apps Activas</SidebarGroupLabel>
      <SidebarMenu>
        {activeApps.map(app => (
          <SidebarMenuItem key={app.name}>
            <SidebarMenuButton asChild>
              <a href={app.url}>
                {typeof app.icon === 'string' ? (
                  <div className="relative h-5 w-5 mr-2">
                    <Image src={app.icon} alt={app.name} fill className="object-contain" />
                  </div>
                ) : (
                  <app.icon />
                )}
                <span>{app.name}</span>
              </a>
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
