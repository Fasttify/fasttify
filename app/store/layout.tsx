'use client'

import { ChatWidget } from '@/app/store/components/ai-chat/ChatWidget'
import { AppSidebar } from '@/app/store/components/sidebar/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useEffect } from 'react'
import { SearchNavigation } from '@/app/store/components/search-bar/SearchNavigation'
import { NotificationPopover } from '@/app/store/components/notifications/NotificationPopover'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.title = 'Mi tienda • Fasttify'
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Updated header to match the Shopify-style dark header */}
        <header className="flex h-16 shrink-0 items-center justify-between px-4 text-white transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-[#2a2a2a]" />
            <Separator orientation="vertical" className="h-4" />
          </div>

          {/* Search bar component */}
          <div className="relative max-w-md w-full">
            <SearchNavigation />
          </div>

          {/* Right side with notifications and user profile */}
          <div className="flex items-center gap-3">
            <NotificationPopover />
            {/* Aquí se pueden agregar más componentes como perfil de usuario */}
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-100 mt-8 ">
          {children}
          <ChatWidget />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
