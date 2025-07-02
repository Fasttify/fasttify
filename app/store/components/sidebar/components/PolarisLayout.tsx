'use client';

import { NavigationPolaris } from '@/app/store/components/sidebar/components/NavigationPolaris';
import { TopBarPolaris } from '@/app/store/components/sidebar/components/TopBarPolaris';
import { PageTransition } from '@/components/ui/page-transition';
import { AppProvider, Frame } from '@shopify/polaris';
import translations from '@shopify/polaris/locales/es.json';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PolarisLayoutProps {
  children: React.ReactNode;
  storeId: string;
  prefersReducedMotion?: boolean;
}

// Custom Link component for Polaris integration with Next.js
function PolarisLinkComponent({ children, url = '', external = false, ...rest }: any) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!external && url) {
      e.preventDefault();
      router.push(url);
    }
  };

  if (external) {
    return (
      <a href={url} {...rest} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={url} {...rest} onClick={handleClick}>
      {children}
    </Link>
  );
}

export function PolarisLayout({ children, storeId, prefersReducedMotion = false }: PolarisLayoutProps) {
  // Estado para controlar la visibilidad del navigation en móvil
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  // Configuración del logo
  const logo = {
    topBarSource: '/icons/fasttify-white.webp',
    width: 40,
    url: '/',
    accessibilityLabel: 'Fasttify',
  };

  const handleNavigationToggle = () => {
    setMobileNavigationActive(!mobileNavigationActive);
  };

  return (
    <AppProvider i18n={translations} theme="light" linkComponent={PolarisLinkComponent}>
      <div style={{ height: '100vh' }}>
        <Frame
          topBar={<TopBarPolaris storeId={storeId} onNavigationToggle={handleNavigationToggle} />}
          navigation={<NavigationPolaris storeId={storeId} />}
          showMobileNavigation={mobileNavigationActive}
          onNavigationDismiss={() => setMobileNavigationActive(false)}
          logo={logo}>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-[#f3f4f6]">
            <PageTransition enabled={!prefersReducedMotion}>{children}</PageTransition>
          </main>
        </Frame>
      </div>
    </AppProvider>
  );
}
