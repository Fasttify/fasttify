'use client'

import { ChatWidget } from '@/app/store/components/ai-chat/ChatWidget'
import { AppSidebar } from '@/app/store/components/sidebar/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useEffect } from 'react'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.title = 'Mi tienda • Fasttify'
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-gray-100 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-100">
          {children}
          <ChatWidget />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
