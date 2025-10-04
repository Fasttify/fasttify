'use client';

import { useState, useCallback, useMemo } from 'react';
import { TopBar, ActionList, SkeletonThumbnail, SkeletonBodyText } from '@shopify/polaris';
import { ExitIcon } from '@shopify/polaris-icons';
import { useRouter } from 'next/navigation';
import { generateSearchRoutes } from '@/app/store/components/search-bar/components/SearchRoutes';
import { useAuth } from '@/context/hooks/useAuth';
import useStoreDataStore from '@/context/core/storeDataStore';
import { useIsClient } from '@/hooks/ui/useIsClient';
import { ChatTrigger } from '@/app/store/components/ai-chat/components/ChatTrigger';
import { NotificationPopover } from '@/app/store/components/notifications/components/NotificationPopover';
import { useSecureUrl } from '@/hooks/auth/useSecureUrl';

interface TopBarPolarisProps {
  storeId: string;
  onNavigationToggle?: () => void;
}

export function TopBarPolaris({ storeId, onNavigationToggle }: TopBarPolarisProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isClient = useIsClient();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { clearStore, currentStore } = useStoreDataStore();
  const storeName = currentStore?.storeName;
  const userPicture = user?.picture;

  const { url: secureUserPicture, isLoading: isPictureLoading } = useSecureUrl({
    baseUrl: userPicture || '',
    type: 'profile-image',
    enabled: !!userPicture,
  });

  const handleChangeStore = async () => {
    await clearStore();
    router.push('/my-store');
  };

  // Generar rutas de búsqueda usando la función existente
  const searchRoutes = useMemo(() => {
    return storeId ? generateSearchRoutes(storeId) : [];
  }, [storeId]);

  // Filtrar rutas basado en el texto de búsqueda
  const filteredRoutes = useMemo(() => {
    if (!searchValue) return searchRoutes.slice(0, 14); // Mostrar las primeras 14 rutas por defecto

    return searchRoutes
      .filter((route) => {
        return (
          route.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          route.path.toLowerCase().includes(searchValue.toLowerCase()) ||
          route.keywords?.some((keyword) => keyword.toLowerCase().includes(searchValue.toLowerCase()))
        );
      })
      .slice(0, 14); // Limitar a 8 resultados
  }, [searchValue, searchRoutes]); // Limitar a 14 resultados

  const toggleIsUserMenuOpen = useCallback(() => setIsUserMenuOpen((prev) => !prev), []);

  const handleSearchResultsDismiss = useCallback(() => {
    setIsSearchActive(false);
    setSearchValue('');
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setIsSearchActive(value.length > 0);
  }, []);

  const handleNavigationToggle = useCallback(() => {
    onNavigationToggle?.();
  }, [onNavigationToggle]);

  const handleSearchResultSelect = useCallback(
    (path: string) => {
      router.push(path);
      handleSearchResultsDismiss();
    },
    [router, handleSearchResultsDismiss]
  );

  const userMenuMarkup =
    !isClient || loading || isPictureLoading ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--p-space-200)',
          padding: 'var(--p-space-200)',
        }}>
        <SkeletonThumbnail size="small" />
        <div className="hidden sm:block" style={{ width: '120px' }}>
          <SkeletonBodyText lines={2} />
        </div>
      </div>
    ) : (
      <TopBar.UserMenu
        actions={[
          {
            items: [
              {
                content: 'Configuración de Tienda',
                onAction: () => router.push(`/store/${storeId}/setup`),
              },
              {
                content: 'Mi Perfil',
                onAction: () => router.push('/account-settings?section=cuenta'),
              },
            ],
          },
          {
            items: [
              { content: 'Centro de Ayuda' },
              { content: 'Cambiar de Tienda', icon: ExitIcon, onAction: () => handleChangeStore() },
            ],
          },
        ]}
        name={storeName || ''}
        initials={storeId?.charAt(0) || 'T'}
        open={isUserMenuOpen}
        onToggle={toggleIsUserMenuOpen}
        avatar={secureUserPicture || undefined}
      />
    );

  const searchFieldMarkup = (
    <TopBar.SearchField
      onChange={!isClient || loading ? () => {} : handleSearchChange}
      value={searchValue}
      placeholder={!isClient || loading ? 'Cargando...' : 'Buscar rutas y páginas... '}
      showFocusBorder
      focused={isSearchActive}
    />
  );

  const searchResultsMarkup =
    !isClient || loading ? (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <SkeletonThumbnail size="small" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SkeletonThumbnail size="small" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SkeletonThumbnail size="small" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
          </div>
        </div>
      </div>
    ) : (
      <ActionList
        items={filteredRoutes.map((route) => ({
          content: route.label,
          onAction: () => handleSearchResultSelect(route.path),
          suffix: route.section,
          prefix: route.icon ? <route.icon size={16} /> : undefined,
        }))}
      />
    );

  const secondaryMenuMarkup = (
    <div className="flex items-center gap-0">
      {/* Acciones personalizadas integradas */}
      <div className="hidden md:block">
        <ChatTrigger />
      </div>
      <NotificationPopover />

      {/* Menú de ayuda */}
    </div>
  );

  return (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      secondaryMenu={secondaryMenuMarkup}
      searchResultsVisible={isSearchActive}
      searchField={searchFieldMarkup}
      searchResults={searchResultsMarkup}
      onSearchResultsDismiss={handleSearchResultsDismiss}
      onNavigationToggle={handleNavigationToggle}
    />
  );
}
