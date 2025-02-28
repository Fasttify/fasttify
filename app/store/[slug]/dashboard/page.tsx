'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { AppSidebar } from '@/app/store/components/sidebar/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useStore } from '@/app/store/hooks/useStore'
import { EcommerceSetup } from '@/app/store/components/store-setup/EcommerceSetup'

export default function DashboardPage() {
  const params = useParams()
  const { store } = useStore(params.slug as string)

  useEffect(() => {
    if (store?.storeName) {
      document.title = `${store.storeName} • Fasttify`
    }
  }, [store?.storeName])

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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-100">
          <EcommerceSetup />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
