'use client'

import { useState } from 'react'
import { Frame, AppProvider } from '@shopify/polaris'
import { TopBarPolaris } from '@/app/store/components/sidebar/components/top-bar-polaris'
import { NavigationPolaris } from '@/app/store/components/sidebar/components/navigation-polaris'
import { PageTransition } from '@/components/ui/page-transition'

interface PolarisLayoutProps {
  children: React.ReactNode
  storeId: string
  prefersReducedMotion?: boolean
}

export function PolarisLayout({
  children,
  storeId,
  prefersReducedMotion = false,
}: PolarisLayoutProps) {
  // Estado para controlar la visibilidad del navigation en móvil
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false)

  // Configuración del logo
  const logo = {
    topBarSource: '/icons/fasttify-white.webp',
    width: 40,
    url: '/',
    accessibilityLabel: 'Fasttify',
  }

  const handleNavigationToggle = () => {
    setMobileNavigationActive(!mobileNavigationActive)
  }

  return (
    <AppProvider i18n={{}} theme="light">
      <div style={{ height: '100vh' }}>
        <Frame
          topBar={<TopBarPolaris storeId={storeId} onNavigationToggle={handleNavigationToggle} />}
          navigation={<NavigationPolaris storeId={storeId} />}
          showMobileNavigation={mobileNavigationActive}
          onNavigationDismiss={() => setMobileNavigationActive(false)}
          logo={logo}
        >
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-[#f3f4f6] overflow-auto min-h-screen">
            <PageTransition enabled={!prefersReducedMotion}>{children}</PageTransition>
          </main>
        </Frame>
      </div>
    </AppProvider>
  )
}
