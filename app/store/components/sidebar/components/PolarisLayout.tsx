'use client';

import { NavigationPolaris } from '@/app/store/components/sidebar/components/NavigationPolaris';
import { TopBarPolaris } from '@/app/store/components/sidebar/components/TopBarPolaris';
import { PageTransition } from '@/components/ui/page-transition';
import { AppProvider, Frame } from '@shopify/polaris';
import translations from '@shopify/polaris/locales/es.json';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useMemo, memo } from 'react';

interface PolarisLayoutProps {
  children: React.ReactNode;
  storeId: string;
  prefersReducedMotion?: boolean;
}

const PolarisLinkComponent = memo(({ children, url = '', external = false, ...rest }: any) => {
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!external && url) {
        e.preventDefault();
        router.push(url);
      }
    },
    [external, url, router]
  );

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
});

PolarisLinkComponent.displayName = 'PolarisLinkComponent';

export const PolarisLayout = memo(({ children, storeId, prefersReducedMotion = false }: PolarisLayoutProps) => {
  // Estado para controlar la visibilidad del navigation en móvil
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  // Memoizar la configuración del logo para evitar recreaciones
  const logo = useMemo(
    () => ({
      topBarSource: 'https://cdn.fasttify.com/assets/b/fasttify-white.webp',
      width: 40,
      url: '/',
      accessibilityLabel: 'Fasttify',
    }),
    []
  );

  // Memoizar las funciones de callback para evitar re-renders
  const handleNavigationToggle = useCallback(() => {
    setMobileNavigationActive((prev) => !prev);
  }, []);

  const handleNavigationDismiss = useCallback(() => {
    setMobileNavigationActive(false);
  }, []);

  // Memoizar los componentes de navegación para evitar re-renders
  const topBarComponent = useMemo(
    () => <TopBarPolaris storeId={storeId} onNavigationToggle={handleNavigationToggle} />,
    [storeId, handleNavigationToggle]
  );

  const navigationComponent = useMemo(() => <NavigationPolaris storeId={storeId} />, [storeId]);

  return (
    <AppProvider i18n={translations} theme="light" linkComponent={PolarisLinkComponent}>
      <div style={{ height: '100vh' }}>
        <Frame
          topBar={topBarComponent}
          navigation={navigationComponent}
          showMobileNavigation={mobileNavigationActive}
          onNavigationDismiss={handleNavigationDismiss}
          logo={logo}>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-[#f3f4f6]">
            <PageTransition enabled={!prefersReducedMotion}>{children}</PageTransition>
          </main>
        </Frame>
      </div>
    </AppProvider>
  );
});

PolarisLayout.displayName = 'PolarisLayout';
