'use client'

import { ChatWidget } from '@/app/store/components/ai-chat/ChatWidget'
import { AppSidebar } from '@/app/store/components/sidebar/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { SearchNavigation } from '@/app/store/components/search-bar/SearchNavigation'
import { NotificationPopover } from '@/app/store/components/notifications/NotificationPopover'
import { PageTransition } from '@/components/ui/page-transition'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    document.title = 'Mi tienda • Fasttify'

    // Comprobar si el usuario prefiere reducir el movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-4 text-[#f3f4f6] transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-[#2a2a2a]" />
            <Separator orientation="vertical" className="h-4" />
          </div>

          <div className="relative max-w-md w-full">
            <SearchNavigation />
          </div>

          <div className="flex items-center gap-3">
            <NotificationPopover />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-[#f3f4f6]">
          <PageTransition enabled={!prefersReducedMotion}>{children}</PageTransition>
          <ChatWidget />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
