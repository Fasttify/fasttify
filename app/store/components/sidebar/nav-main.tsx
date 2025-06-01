'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
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
  const { currentStore, isLoading } = useStoreDataStore()
  const [openItem, setOpenItem] = useState<string | null>(null)
  const { state } = useSidebar()
  const isExpanded = state === 'expanded'

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
        {isLoading ? <Skeleton className="w-full h-4" /> : <> {currentStore?.storeName}</>}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => {
          const isItemActive = item.url && pathname.startsWith(item.url)
          const hasActiveChild = item.items?.some(subItem => pathname === subItem.url)

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isExpanded && openItem === item.title}
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
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => handleItemClick(item.title)}
                    isActive={isItemActive || hasActiveChild}
                  >
                    {item.icon && <item.icon />}
                    {item.url ? (
                      <Link href={item.url} className="flex-1" onClick={e => {}}>
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <span>{item.title}</span>
                    )}
                    {isExpanded && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {isExpanded && (
                  <CollapsibleContent>
                    {/* Custom styled submenu with line indicators */}
                    <div className="relative ml-4 pl-4 border-l border-gray-300 mt-1">
                      {item.items?.map(subItem => {
                        // Check if this sub-item is active based on the exact path match
                        const isSubItemActive = pathname === subItem.url

                        return (
                          <div key={subItem.title} className="relative">
                            {/* Horizontal connector line */}
                            <div className="absolute -left-4 top-1/2 w-3 h-px bg-gray-300"></div>

                            <Link
                              href={subItem.url}
                              className={`block py-1.5 px-2 text-sm rounded-md transition-colors ${
                                isSubItemActive
                                  ? 'bg-white text-gray-900 font-medium shadow-sm'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
