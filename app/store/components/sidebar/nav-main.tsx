import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import useStoreDataStore from '@/context/core/storeDataStore'

interface NavMainProps {
  items: {
    title: string
    url?: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  storeName?: string
  isLoading?: boolean
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()
  const { currentStore, isLoading, clearStore } = useStoreDataStore()
  const [openItem, setOpenItem] = useState<string | null>(null)

  useEffect(() => {
    const activeItem = items.find(item => {
      const isCurrentPath = item.url && pathname.startsWith(item.url)
      const hasActiveChild = item.items?.some(subItem => pathname === subItem.url)
      return isCurrentPath || hasActiveChild
    })

    if (activeItem) {
      setOpenItem(activeItem.title)
    }
  }, [pathname, items])

  const handleItemClick = (title: string) => {
    setOpenItem(title)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-medium text-gray-800">
        Mi tienda - {isLoading ? 'Cargando...' : currentStore?.storeName}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <Collapsible
            key={item.title}
            asChild
            open={openItem === item.title}
            onOpenChange={isOpen => {
              if (isOpen) {
                setOpenItem(item.title)
              } else if (openItem === item.title) {
                setOpenItem(null)
              }
            }}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} onClick={() => handleItemClick(item.title)}>
                  {item.icon && <item.icon />}
                  {item.url ? (
                    <Link href={item.url} className="flex-1" onClick={e => {}}>
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <span>{item.title}</span>
                  )}
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map(subItem => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
